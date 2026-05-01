/**
 * SKINR -- Stripe Webhook + PDF Generation + Gmail Delivery
 * v4.0 -- Production ready
 *
 * FIXES IN THIS VERSION:
 * 1. PDF Y-tracking uses doc.y (PDFKit actual cursor) not heightOfString estimate
 * 2. Language passed through full stack: App -> Stripe metadata -> Webhook -> Claude prompt -> PDF
 * 3. System prompt enforces zero markdown from Claude
 * 4. Fast generation: prompts optimised for Haiku speed
 */

"use strict";
const crypto      = require("crypto");
const https       = require("https");
const nodemailer  = require("nodemailer");
const PDFDocument = require("pdfkit");

// ── BRAND ─────────────────────────────────────────────────────────────────────
const C = {
  bg:     "#050505",
  header: "#080808",
  gold:   "#B8972A",
  white:  "#F2EEE6",
  cream:  "#D8D2C8",
  soft:   "#B8AEA6",
  muted:  "#4E4844",
  border: "#1E1A14",
};

const LABELS = {
  "biology":        "Skin Biology Report",
  "routine":        "Personalised Routine Card",
  "skin-combo":     "Skin Analysis Bundle",
  "shave-biology":  "Shave Biology Report",
  "shave-card":     "Shave Protocol Card",
  "shave-combo":    "Shave Protocol Bundle",
  "skincare-guide": "The No-BS Men's Skincare Guide",
  "shaving-guide":  "The Men's Shaving Bible",
  "guides-combo":   "Complete Guide Collection",
};

// ── SIGNATURE VERIFICATION ────────────────────────────────────────────────────
const verifyStripe = (payload, sig, secret) => {
  const parts = sig.split(",");
  const ts    = parts.find(p => p.startsWith("t="))?.split("=")[1];
  const sigs  = parts.filter(p => p.startsWith("v1=")).map(p => p.split("=")[1]);
  if (!ts || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - parseInt(ts)) > 300) return false;
  const expected = crypto.createHmac("sha256", secret)
    .update(`${ts}.${payload}`, "utf8").digest("hex");
  return sigs.some(s => {
    try { return crypto.timingSafeEqual(Buffer.from(s, "hex"), Buffer.from(expected, "hex")); }
    catch (_) { return false; }
  });
};

// ── CLAUDE -- ZERO MARKDOWN SYSTEM PROMPT ────────────────────────────────────
const NO_MD = `You write content for printed PDF reports. ABSOLUTE RULES:
- ZERO markdown. No # ## ### * ** __ - --- > backticks or bullet symbols
- For section headings use ALL CAPS followed by a colon then a new line
- For emphasis use ALL CAPS words inline
- Separate paragraphs with ONE blank line
- Plain prose only. No lists. No dashes as bullets.
These rules are non-negotiable. Any markdown symbol ruins the document.`;

const claude = (prompt, maxTokens = 1800) => new Promise((resolve, reject) => {
  const body = JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: maxTokens,
    system: NO_MD,
    messages: [{ role: "user", content: prompt }],
  });
  const req = https.request({
    hostname: "api.anthropic.com",
    path:     "/v1/messages",
    method:   "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
  }, res => {
    let d = "";
    res.on("data", c => d += c);
    res.on("end", () => {
      try { resolve(JSON.parse(d).content?.[0]?.text || ""); }
      catch (_) { resolve(""); }
    });
  });
  req.on("error", reject);
  req.write(body);
  req.end();
});

// Strip any markdown that still slips through
const clean = text => text
  .replace(/^#{1,6}\s+/gm, "")
  .replace(/\*\*(.+?)\*\*/g, "$1")
  .replace(/\*(.+?)\*/g, "$1")
  .replace(/^[-*]{3,}\s*$/gm, "")
  .replace(/^>\s+/gm, "")
  .replace(/`(.+?)`/g, "$1")
  .replace(/^\s*[-*+]\s+/gm, "")
  .replace(/\[(.+?)\]\(.+?\)/g, "$1")
  .trim();

// ── REPORT CONTENT GENERATION ─────────────────────────────────────────────────
const generate = async (product, skinType, lang) => {
  const ln = lang === "fr" ? "Quebec French" : lang === "es" ? "Latin American Spanish" : "English";
  const st = skinType || "combination";

  // Guide products return static table of contents
  if (product.includes("guide")) {
    const skincareToC = `THE NO-BS MEN'S SKINCARE GUIDE - TABLE OF CONTENTS

SECTION 1 - WHY MOST MEN'S SKIN ROUTINES FAIL
SECTION 2 - THE BIOLOGY YOU NEED TO KNOW
   The Skin Barrier, Sebum and Oil Production, Cellular Turnover, The pH Factor
SECTION 3 - SKIN TYPES: CLINICAL DEFINITIONS
   Dry, Oily, Combination, Sensitive, Acne-Prone
SECTION 4 - THE INGREDIENT GUIDE
   Niacinamide, Retinol, Salicylic Acid, Hyaluronic Acid, Vitamin C, Ceramides, AHAs, Benzoyl Peroxide, SPF
SECTION 5 - BUILDING YOUR ROUTINE
   Morning routine, Evening routine, Starter routine for beginners
SECTION 6 - HOW TO READ A PRODUCT LABEL
SECTION 7 - THE MOST COMMON MISTAKES MEN MAKE
SECTION 8 - HYPERPIGMENTATION AND DARK SPOTS
SECTION 9 - WHEN TO SEE A DERMATOLOGIST

ACCESS YOUR COMPLETE 5,000-WORD GUIDE:
Your full guide is in the SKINR app at skinrfinal.netlify.app under the Guides tab.
Your purchase is permanently saved to your browser.`;

    const shavingToC = `THE MEN'S SHAVING BIBLE - TABLE OF CONTENTS

SECTION 1 - WHY YOUR SHAVE IS FAILING
SECTION 2 - WHAT SHAVING DOES TO YOUR SKIN
   Mechanics of the cut, Pseudofolliculitis barbae, The acid mantle
SECTION 3 - RAZOR SCIENCE: EVERY TYPE EXPLAINED
   Multi-blade cartridge, Safety DE razor, Electric foil, Straight razor, OneBlade
SECTION 4 - CLINICAL TECHNIQUE PHASE BY PHASE
   Pre-shave protocol, The shave, Post-shave recovery
SECTION 5 - TECHNIQUE BY BEARD TYPE
   Fine straight, Medium, Coarse straight, Coarse curly, Patchy
SECTION 6 - TREATING ACTIVE RAZOR BUMPS
SECTION 7 - PRODUCTS THAT WORK: INGREDIENT-LED RECOMMENDATIONS
SECTION 8 - ELECTRIC SHAVER OPTIMISATION
SECTION 9 - WHEN TO SEE A DERMATOLOGIST

ACCESS YOUR COMPLETE 5,500-WORD GUIDE:
Your full guide is in the SKINR app at skinrfinal.netlify.app under the Guides tab.`;

    if (product === "guides-combo") return { skincare: skincareToC, shaving: shavingToC };
    if (product === "skincare-guide") return { main: skincareToC };
    if (product === "shaving-guide") return { main: shavingToC };
  }

  const prompts = {
    biology: `Write a personalised skin biology report in ${ln} for ${st} skin. Plain text only, no markdown.

YOUR SKIN BIOLOGY:
Explain in 2 paragraphs why ${st} skin behaves the way it does at the cellular level. Be specific to this skin type.

THE ROOT CAUSES:
Explain in 2 paragraphs the biological mechanisms behind the main concerns of ${st} skin.

YOUR INGREDIENT SCIENCE:
Explain in 2 paragraphs which ingredients work for ${st} skin and why at the molecular level.

YOUR TRAJECTORY:
Explain in 1 paragraph what happens to ${st} skin over time with proper care versus without.

Write in clinical but accessible prose. Address reader directly as "your skin". No bullet points. No markdown.`,

    routine: `Write a personalised daily routine card in ${ln} for ${st} skin. Plain text only, no markdown.

MORNING ROUTINE:
Step 1 - Cleanser: [product type, exact application, timing, clinical reason]
Step 2 - [Serum or treatment appropriate for ${st} skin]: [exact method, timing, reason]
Step 3 - Moisturiser: [appropriate for ${st} skin, method, amount]
Step 4 - SPF: [application, why non-negotiable for ${st} skin]

EVENING ROUTINE:
Step 1 - Cleanser: [method]
Step 2 - [Treatment appropriate for ${st} skin]: [method, timing, clinical reason]
Step 3 - Moisturiser: [richer than morning, method, why]

GOLDEN RULES FOR ${st.toUpperCase()} SKIN:
Rule 1: [specific to this skin type]
Rule 2: [specific to this skin type]
Rule 3: [specific to this skin type]

THE ONE THING TO REMEMBER:
[One powerful sentence about ${st} skin]`,

    "shave-biology": `Write a personalised shave biology report in ${ln} for someone with ${st} skin. Plain text only, no markdown.

THE BIOLOGY OF YOUR SHAVING PROBLEM:
Explain in 2 paragraphs why ${st} skin combined with shaving creates the specific problems it does at the cellular level.

THE RAZOR MECHANICS:
Explain in 2 paragraphs why certain blade types cause more damage for this skin and beard type combination.

THE HEALING SCIENCE:
Explain in 1 paragraph what happens during post-shave recovery for ${st} skin and why the protocol accelerates it.

YOUR PROTOCOL RATIONALE:
Explain in 1 paragraph why each element of the recommended shaving protocol works for this specific biology.

Write in clinical but accessible prose. No bullet points. No markdown.`,

    "shave-card": `Write a personalised shave protocol card in ${ln} for ${st} skin. Plain text only, no markdown.

PRE-SHAVE PROTOCOL:
Step 1 - [Action]: [exact method], Duration: [time], Why: [clinical reason]
Step 2 - [Action]: [exact method], Duration: [time], Why: [clinical reason]
Step 3 - [Product]: [application], Duration: [time], Why: [physiological reason]

THE SHAVE:
Step 1 - [Direction and technique]: [exact instruction], Why: [reason]
Step 2 - [Rinse protocol]: [instruction], Why: [reason]

POST-SHAVE RECOVERY:
Step 1 - Cold water rinse: [duration], Why: [vasoconstriction effect]
Step 2 - [Treatment product for ${st} skin]: [exact method], Why: [effect]
Step 3 - Moisturiser: [appropriate for ${st} skin, amount and method], Why: [barrier repair]

BLADE RECOMMENDATION:
Specific razor: [name and model appropriate for ${st} skin]
Why: [clinical reason for this skin type]

CRITICAL RULE:
[The single most important instruction for ${st} skin - one sentence]`,
  };

  if (product === "skin-combo") {
    const [bio, card] = await Promise.all([claude(prompts.biology), claude(prompts.routine)]);
    return { biology: clean(bio), routine: clean(card) };
  }
  if (product === "shave-combo") {
    const [bio, card] = await Promise.all([claude(prompts["shave-biology"]), claude(prompts["shave-card"])]);
    return { shaveBiology: clean(bio), shaveCard: clean(card) };
  }
  const text = await claude(prompts[product] || prompts.biology);
  return { main: clean(text) };
};

// ── PDF BUILDER -- doc.y CURSOR FIX ──────────────────────────────────────────
const buildPDF = (product, content, skinType, lang) => new Promise((resolve, reject) => {
  try {
    const label = LABELS[product] || "SKINR Report";
    const doc = new PDFDocument({ size: "A4", margin: 0,
      info: { Title: label, Author: "SKINR", Subject: "Clinical Report" },
    });

    const chunks = [];
    doc.on("data", c => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const PW = 595.28;
    const PH = 841.89;
    const M  = 50;
    const CW = PW - M * 2;
    const FOOTER_Y = PH - 44;

    // ── HELPERS ──────────────────────────────────────────────────────────────
    const bg = () => doc.rect(0, 0, PW, PH).fill(C.bg);
    const topBar = () => doc.rect(0, 0, PW, 3).fill(C.gold);

    const footer = () => {
      doc.moveTo(M, FOOTER_Y).lineTo(PW - M, FOOTER_Y)
        .strokeColor(C.border).lineWidth(0.3).stroke();
      doc.font("Helvetica").fontSize(7).fillColor(C.muted)
        .text("SKINR  --  skinrfinal.netlify.app  --  Free. Clinical. Built for Men.",
          M, FOOTER_Y + 8, { width: CW, align: "center", lineBreak: false });
    };

    // ── HEADER (first page) ──────────────────────────────────────────────────
    bg();
    topBar();
    doc.rect(0, 3, PW, 82).fill(C.header);
    // Gold diamond
    doc.save().translate(M, 44).rotate(45).rect(-7, -7, 14, 14).fill(C.gold).restore();
    // Wordmark
    doc.font("Helvetica-Bold").fontSize(21).fillColor(C.white)
      .text("SKINR", M + 18, 34, { lineBreak: false });
    doc.font("Helvetica").fontSize(7).fillColor(C.soft)
      .text("FREE. CLINICAL. BUILT FOR MEN.", M + 18, 58,
        { lineBreak: false, characterSpacing: 1.5 });
    doc.font("Helvetica").fontSize(8).fillColor(C.gold)
      .text("getskinr.com", PW - M - 70, 44, { lineBreak: false });
    // Divider
    doc.moveTo(M, 85).lineTo(PW - M, 85).strokeColor(C.gold).lineWidth(0.5).stroke();
    footer();

    // ── TITLE BLOCK ──────────────────────────────────────────────────────────
    // Use absolute Y, then track via doc.y after each call
    doc.font("Helvetica").fontSize(7.5).fillColor(C.gold)
      .text(label.toUpperCase(), M, 100, { characterSpacing: 2, lineBreak: false });

    let y = doc.y + 10;

    if (skinType) {
      const pfx = lang === "fr" ? "Profil: " : lang === "es" ? "Perfil: " : "Profile: ";
      doc.font("Helvetica").fontSize(9).fillColor(C.soft)
        .text(pfx + skinType, M, y, { lineBreak: false });
      y = doc.y + 6;
    }

    const date = new Date().toLocaleDateString(
      lang === "fr" ? "fr-CA" : lang === "es" ? "es-MX" : "en-CA",
      { year: "numeric", month: "long", day: "numeric" }
    );
    doc.font("Helvetica").fontSize(8).fillColor(C.muted)
      .text(date, M, y, { lineBreak: false });
    y = doc.y + 14;

    doc.moveTo(M, y).lineTo(PW - M, y).strokeColor(C.border).lineWidth(0.3).stroke();
    y += 14;

    // ── NEW PAGE HELPER ───────────────────────────────────────────────────────
    const newPage = () => {
      doc.addPage();
      bg();
      topBar();
      footer();
      y = 24;
    };

    const ensureSpace = (needed) => {
      if (y + needed > FOOTER_Y - 20) newPage();
    };

    // ── SECTION HEADER ────────────────────────────────────────────────────────
    const sectionHeader = (title) => {
      ensureSpace(36);
      doc.rect(M, y, CW, 26).fill("#0D0D0D");
      doc.rect(M, y, 3, 26).fill(C.gold);
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.gold)
        .text(title.toUpperCase(), M + 12, y + 8,
          { lineBreak: false, characterSpacing: 1.5 });
      y += 34;
    };

    // ── TEXT BLOCK -- KEY FIX: use doc.y after render ─────────────────────────
    const writeText = (text, isSubhead = false) => {
      if (!text || !text.trim()) return;
      const fontSize   = isSubhead ? 9  : 10;
      const font       = isSubhead ? "Helvetica-Bold" : "Helvetica";
      const color      = isSubhead ? C.cream : C.soft;
      const lineGap    = isSubhead ? 1 : 3;
      const afterGap   = isSubhead ? 4 : 9;

      // Estimate needed space -- use at least 2 lines worth
      const lineH = fontSize * 1.4;
      ensureSpace(lineH * 2);

      doc.font(font).fontSize(fontSize).fillColor(color)
        .text(text, M, y, { width: CW, lineGap });

      // CRITICAL FIX: read actual cursor position AFTER render
      y = doc.y + afterGap;
    };

    // ── CONTENT RENDERER ──────────────────────────────────────────────────────
    const renderSection = (title, text) => {
      if (!text || !text.trim()) return;
      sectionHeader(title);

      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
      for (const para of paragraphs) {
        const lines = para.split("\n").filter(l => l.trim());
        for (const line of lines) {
          const t = line.trim();
          if (!t) continue;

          // Sub-heading detection: ALL CAPS short lines or ends with colon
          const isAllCaps = t === t.toUpperCase()
            && t.length > 2
            && t.length < 90
            && /[A-Z]/.test(t);

          writeText(t, isAllCaps || t.endsWith(":"));
        }
        // Paragraph gap
        y += 4;
      }
      y += 6;
    };

    // ── RENDER ALL CONTENT ────────────────────────────────────────────────────
    const titleMap = {
      en: {
        biology:     "Skin Biology Report",
        routine:     "Your Daily Routine Card",
        shaveBiology:"Shave Biology Report",
        shaveCard:   "Your Shave Protocol Card",
        skincare:    "Men's Skincare Guide",
        shaving:     "Men's Shaving Bible",
        main:        LABELS[product] || "Your Report",
      },
      fr: {
        biology:     "Rapport de Biologie Cutanee",
        routine:     "Votre Carte de Routine",
        shaveBiology:"Rapport de Biologie du Rasage",
        shaveCard:   "Votre Carte de Protocole de Rasage",
        skincare:    "Guide Soins Hommes",
        shaving:     "Bible du Rasage Hommes",
        main:        LABELS[product] || "Votre Rapport",
      },
      es: {
        biology:     "Informe de Biologia Cutanea",
        routine:     "Tu Tarjeta de Rutina",
        shaveBiology:"Informe de Biologia del Afeitado",
        shaveCard:   "Tu Tarjeta de Protocolo de Afeitado",
        skincare:    "Guia de Cuidado de Piel",
        shaving:     "Biblia del Afeitado",
        main:        LABELS[product] || "Tu Informe",
      },
    };
    const T = titleMap[lang] || titleMap.en;

    if (content.biology)     renderSection(T.biology,     content.biology);
    if (content.routine)     renderSection(T.routine,     content.routine);
    if (content.shaveBiology)renderSection(T.shaveBiology,content.shaveBiology);
    if (content.shaveCard)   renderSection(T.shaveCard,   content.shaveCard);
    if (content.skincare)    renderSection(T.skincare,    content.skincare);
    if (content.shaving)     renderSection(T.shaving,     content.shaving);
    if (content.main)        renderSection(T.main,        content.main);

    // ── DISCLAIMER ────────────────────────────────────────────────────────────
    ensureSpace(72);
    y += 8;
    doc.rect(M, y, CW, 58).fill("#0A0A0A");
    doc.rect(M, y, CW, 58).stroke(C.border);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(C.gold)
      .text(
        lang === "fr" ? "AVIS MEDICAL" : lang === "es" ? "AVISO MEDICO" : "MEDICAL DISCLAIMER",
        M + 12, y + 10, { characterSpacing: 1.5, lineBreak: false }
      );
    const dis = lang === "fr"
      ? "Ce rapport fournit des orientations cliniques generales. Consultez un dermatologue pour tout probleme persistant de peau ou de rasage."
      : lang === "es"
      ? "Este informe proporciona orientacion clinica general. Consulte a un dermatologo para cualquier problema persistente de piel o afeitado."
      : "This report provides general clinical guidance and is not a substitute for professional medical advice. Consult a dermatologist for any persistent skin or shaving concern.";
    doc.font("Helvetica").fontSize(8).fillColor(C.muted)
      .text(dis, M + 12, y + 26, { width: CW - 24 });
    y += 70;

    // ── FOOTER TEXT ──────────────────────────────────────────────────────────
    ensureSpace(40);
    y += 8;
    doc.moveTo(M, y).lineTo(PW - M, y).strokeColor(C.border).lineWidth(0.3).stroke();
    y += 12;
    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.gold)
      .text("SKINR", M, y, { lineBreak: false, continued: true });
    doc.font("Helvetica").fontSize(9).fillColor(C.muted)
      .text("  --  Free. Clinical. Built for Men.", { lineBreak: false });
    y = doc.y + 8;
    doc.font("Helvetica").fontSize(7.5).fillColor(C.muted)
      .text(
        "Amazon affiliate links support this free service at no extra cost to you. All recommendations are based solely on clinical evidence.",
        M, y, { width: CW }
      );

    doc.end();
  } catch (err) {
    reject(err);
  }
});

// ── EMAIL ─────────────────────────────────────────────────────────────────────
const emailHtml = (label, skinType, lang) => `
<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:Arial,sans-serif;">
<div style="max-width:580px;margin:0 auto;background:#050505;border:1px solid #1E1A14;">
  <div style="height:3px;background:linear-gradient(90deg,#B8972A,#D4AF50,#B8972A);"></div>
  <div style="padding:32px 40px 24px;border-bottom:1px solid #1E1A14;text-align:center;">
    <span style="font-size:11px;letter-spacing:5px;font-weight:700;color:#F2EEE6;">SKINR</span>
    <div style="font-size:8px;letter-spacing:2px;color:#B8AEA6;margin-top:4px;text-transform:uppercase;">Free. Clinical. Built for Men.</div>
  </div>
  <div style="padding:36px 40px;">
    <div style="font-size:9px;letter-spacing:4px;color:#B8972A;text-transform:uppercase;margin-bottom:12px;">
      ${lang === "fr" ? "Votre rapport est pret" : lang === "es" ? "Tu informe esta listo" : "Your Report Is Ready"}
    </div>
    <h1 style="font-size:20px;color:#F2EEE6;font-weight:700;margin:0 0 18px;line-height:1.3;">${label}</h1>
    ${skinType ? `<div style="background:#0D0D0D;border-left:3px solid #B8972A;padding:10px 14px;margin-bottom:20px;">
      <div style="font-size:9px;letter-spacing:2px;color:#B8972A;text-transform:uppercase;margin-bottom:4px;">
        ${lang === "fr" ? "Prepare pour" : lang === "es" ? "Preparado para" : "Generated for"}
      </div>
      <div style="font-size:14px;color:#F2EEE6;">${skinType}</div>
    </div>` : ""}
    <p style="font-size:14px;color:#D8D2C8;line-height:1.85;margin:0 0 16px;">
      ${lang === "fr"
        ? "Votre rapport clinique personnalise est joint a cet email en PDF. Ouvrez-le sur n'importe quel appareil."
        : lang === "es"
        ? "Tu informe clinico personalizado esta adjunto a este email en PDF. Abralo en cualquier dispositivo."
        : "Your personalised clinical report is attached as a PDF. Open it on any device, save it, print it, keep it."}
    </p>
    <p style="font-size:14px;color:#D8D2C8;line-height:1.85;margin:0 0 28px;">
      ${lang === "fr" ? "Accessible aussi dans l'app SKINR sur" : lang === "es" ? "Tambien accesible en la app SKINR en" : "Also accessible anytime in the SKINR app at"}
      <a href="https://skinrfinal.netlify.app" style="color:#B8972A;text-decoration:none;">skinrfinal.netlify.app</a>
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="https://skinrfinal.netlify.app"
        style="background:#B8972A;color:#050505;padding:13px 32px;text-decoration:none;
          font-size:9px;letter-spacing:3px;text-transform:uppercase;font-weight:700;display:inline-block;">
        ${lang === "fr" ? "Ouvrir SKINR" : lang === "es" ? "Abrir SKINR" : "Open SKINR"}
      </a>
    </div>
  </div>
  <div style="height:1px;background:#1E1A14;margin:0 40px;"></div>
  <div style="padding:20px 40px;text-align:center;">
    <p style="font-size:10px;color:#4E4844;margin:0 0 6px;">SKINR  --  skinrfinal.netlify.app</p>
    <p style="font-size:10px;color:#4E4844;margin:0;line-height:1.6;">
      ${lang === "fr"
        ? "Les liens affilies Amazon soutiennent ce service gratuit sans cout supplementaire."
        : lang === "es"
        ? "Los enlaces de afiliados de Amazon apoyan este servicio gratuito sin costo adicional."
        : "Amazon affiliate links support this free service at no extra cost to you."}
    </p>
  </div>
  <div style="height:2px;background:linear-gradient(90deg,#B8972A,#D4AF50,#B8972A);"></div>
</div></body></html>`;

const sendMail = async (to, subject, html, pdf, filename) => {
  const t = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASS },
  });
  return t.sendMail({
    from: `SKINR <${process.env.GMAIL_USER}>`,
    to, subject, html,
    attachments: [{ filename, content: pdf, contentType: "application/pdf" }],
  });
};

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  // Signature verification
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig    = event.headers["stripe-signature"];
  if (secret && sig && !verifyStripe(event.body, sig, secret)) {
    console.error("Stripe signature verification failed");
    return { statusCode: 400, body: "Invalid signature" };
  }

  try {
    const evt = JSON.parse(event.body);

    if (evt.type === "payment_intent.succeeded") {
      const intent   = evt.data.object;
      const { product, email, skinType, lang = "en" } = intent.metadata;
      const amount   = (intent.amount / 100).toFixed(2);
      const label    = LABELS[product] || "SKINR Report";
      const filename = `SKINR-${label.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;

      console.log(`Payment OK: ${intent.id} | ${product} | $${amount} | ${lang} | ${email || "no email"}`);

      if (email && process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
        try {
          console.log(`Generating ${product} in ${lang}...`);
          const content = await generate(product, skinType, lang);

          console.log("Building PDF...");
          const pdf = await buildPDF(product, content, skinType, lang);

          const subject = lang === "fr"
            ? `Votre ${label} SKINR`
            : lang === "es"
            ? `Tu ${label} SKINR`
            : `Your SKINR ${label}`;

          console.log(`Sending to ${email}...`);
          await sendMail(email, subject, emailHtml(label, skinType, lang), pdf, filename);
          console.log("Delivered OK");

          // Owner notification
          const owner = process.env.GMAIL_USER;
          await nodemailer.createTransport({
            service: "gmail",
            auth: { user: owner, pass: process.env.GMAIL_APP_PASS },
          }).sendMail({
            from: `SKINR <${owner}>`,
            to: owner,
            subject: `[SKINR Sale] ${label} -- $${amount} -- ${email}`,
            html: `<p style="font-family:Arial;font-size:14px;line-height:1.8;">
              <strong>New purchase</strong><br>
              Product: <strong>${label}</strong><br>
              Amount: <strong>$${amount} USD</strong><br>
              Customer: <strong>${email}</strong><br>
              Language: ${lang}<br>
              Skin type: ${skinType || "not provided"}<br>
              Payment ID: ${intent.id}
            </p>`,
          });

        } catch (err) {
          // Log but never fail -- Stripe would retry causing duplicates
          console.error("Delivery error:", err.message);
        }
      }
    }

    if (evt.type === "payment_intent.payment_failed") {
      const intent = evt.data.object;
      console.error(`Payment failed: ${intent.id} -- ${intent.last_payment_error?.message}`);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error("Webhook error:", err.message);
    return { statusCode: 400, body: "Webhook error" };
  }
};
