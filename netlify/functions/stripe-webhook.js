/**
 * SKINR -- Stripe Webhook + PDF Generation + Email Delivery
 * v3.0 -- Complete rewrite after QA/UAT
 *
 * Fixes:
 * 1. PDF text overlap -- uses heightOfString() for correct Y tracking
 * 2. Language -- passes customer language to Claude prompts
 * 3. Delivery speed -- parallel Claude calls, single email send
 * 4. Markdown -- system prompt + post-processing strip
 */

"use strict";

const crypto      = require("crypto");
const https       = require("https");
const nodemailer  = require("nodemailer");
const PDFDocument = require("pdfkit");

// ── BRAND ─────────────────────────────────────────────────────────────────────
const C = {
  bg:     "#050505",
  card:   "#0D0D0D",
  gold:   "#B8972A",
  white:  "#F2EEE6",
  cream:  "#D8D2C8",
  soft:   "#B8AEA6",
  muted:  "#4E4844",
  border: "#1E1A14",
};

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
const LABELS = {
  "biology":        "Skin Biology Report",
  "routine":        "Personalised Daily Routine Card",
  "skin-combo":     "Skin Analysis Bundle",
  "shave-biology":  "Shave Biology Report",
  "shave-card":     "Shave Protocol Card",
  "shave-combo":    "Shave Protocol Bundle",
  "skincare-guide": "The No-BS Men's Skincare Guide",
  "shaving-guide":  "The Men's Shaving Bible",
  "guides-combo":   "Complete Guide Collection",
};

// ── VERIFY STRIPE SIGNATURE ───────────────────────────────────────────────────
const verify = (body, sig, secret) => {
  const parts   = sig.split(",");
  const ts      = parts.find(p => p.startsWith("t="))?.split("=")[1];
  const sigs    = parts.filter(p => p.startsWith("v1=")).map(p => p.split("=")[1]);
  if (!ts || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - parseInt(ts)) > 300) return false;
  const exp = crypto.createHmac("sha256", secret)
    .update(`${ts}.${body}`, "utf8").digest("hex");
  return sigs.some(s => {
    try { return crypto.timingSafeEqual(Buffer.from(s,"hex"), Buffer.from(exp,"hex")); }
    catch(_) { return false; }
  });
};

// ── CALL CLAUDE ───────────────────────────────────────────────────────────────
const callClaude = (prompt, lang) => new Promise((resolve) => {
  const langName = lang === "fr" ? "Quebec French" : lang === "es" ? "Latin American Spanish" : "English";

  const body = JSON.stringify({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: `You are a clinical dermatologist writing professional reports. 
Respond ONLY in ${langName}.
STRICT FORMATTING RULES:
- NO markdown. Zero. No #, ##, **, __, *, \`, ~~~, ---, ===
- NO asterisks for emphasis ever
- NO hash symbols ever
- Write section headings in ALL CAPS followed by a colon and newline
- Write sub-headings with the first letter capitalised, followed by a colon
- Separate paragraphs with ONE blank line
- Do NOT use bullet points or numbered lists
- Do NOT use em-dashes (--) or en-dashes
- Write naturally in flowing prose paragraphs`,
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
  }, (res) => {
    let data = "";
    res.on("data", c => data += c);
    res.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        resolve(parsed.content?.[0]?.text || "");
      } catch(_) { resolve(""); }
    });
  });

  req.setTimeout(20000, () => { req.destroy(); resolve(""); });
  req.on("error", () => resolve(""));
  req.write(body);
  req.end();
});

// ── STRIP RESIDUAL MARKDOWN ───────────────────────────────────────────────────
const clean = (t) => {
  if (!t) return "";
  return t
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.+?)\*\*/gs, "$1")
    .replace(/\*(.+?)\*/gs, "$1")
    .replace(/^[-*+]{3,}\s*$/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/`(.+?)`/gs, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();
};

// ── GENERATE CONTENT ──────────────────────────────────────────────────────────
const generateContent = async (product, skinType, lang, metadata) => {
  const ln = lang === "fr" ? "Quebec French"
           : lang === "es" ? "Latin American Spanish"
           : "English";

  // Guides: static table of contents
  if (product === "skincare-guide" || (product === "guides-combo")) {
    const skincare = lang === "fr"
      ? `LE GUIDE DES SOINS SANS BULLSHIT POUR HOMMES\nRéférence clinique complète pour chaque type de peau\n\nTABLE DES MATIERES:\n\n1. Pourquoi la plupart des routines de soins pour hommes échouent\n2. La biologie que tu dois vraiment comprendre\n   La barrière cutanée, le sébum, le renouvellement cellulaire, le pH\n3. Types de peau: définitions cliniques\n   Sèche, Grasse, Mixte, Sensible, Sujette à l'acné\n4. Guide des ingrédients: ce qui fonctionne vraiment\n   Niacinamide, Rétinol, Acide salicylique, Acide hyaluronique\n   Vitamine C, Céramides, AHA, Peroxyde de benzoyle, FPS\n5. Construire ta routine matin et soir\n6. Comment lire une étiquette de produit\n7. Les erreurs les plus communes que font les hommes\n8. Hyperpigmentation et taches sombres\n9. Quand consulter un dermatologue\n\nTON GUIDE COMPLET EST DANS L'APPLICATION SKINR\nAccède à ton guide complet de 5 000 mots sur getskinr.com dans la section Guides.\nTon achat est sauvegardé de façon permanente dans ton navigateur.`
      : lang === "es"
      ? `LA GUIA SIN RODEOS DE CUIDADO DE PIEL PARA HOMBRES\nReferencia clinica completa para todo tipo de piel\n\nTABLA DE CONTENIDOS:\n\n1. Por que la mayoria de rutinas de cuidado para hombres fallan\n2. La biologia que realmente necesitas saber\n3. Tipos de piel: definiciones clinicas\n4. Guia de ingredientes: lo que realmente funciona\n5. Construir tu rutina de manana y noche\n6. Como leer una etiqueta de producto\n7. Los errores mas comunes que cometen los hombres\n8. Hiperpigmentacion y manchas oscuras\n9. Cuando ver a un dermatologo\n\nTU GUIA COMPLETA ESTA EN LA APLICACION SKINR\nAccede a tu guia completa en getskinr.com en la seccion Guias.`
      : `THE NO-BS MEN'S SKINCARE GUIDE\nA Clinical Reference for Every Skin Type\n\nTABLE OF CONTENTS:\n\n1. Why Most Men's Skin Routines Fail\n2. The Biology You Actually Need to Know\n   The Skin Barrier, Sebum, Cellular Turnover, pH\n3. Skin Types: Clinical Definitions\n   Dry, Oily, Combination, Sensitive, Acne-Prone\n4. The Ingredient Guide: What Actually Works\n   Niacinamide, Retinol, Salicylic Acid, Hyaluronic Acid\n   Vitamin C, Ceramides, AHAs, Benzoyl Peroxide, SPF\n5. Building Your Routine: Morning and Evening\n6. How to Read a Product Label\n7. The Most Common Mistakes Men Make\n8. Hyperpigmentation and Dark Spots\n9. When to See a Dermatologist\n\nYOUR FULL GUIDE IS IN THE SKINR APP\nAccess your complete 5,000-word guide at getskinr.com under the Guides tab.\nYour purchase is permanently saved.`;
    if (product === "skincare-guide") return { skincare };
    if (product === "guides-combo") {
      const shaving = await buildShavingGuideToC(lang);
      return { skincare, shaving };
    }
  }

  if (product === "shaving-guide") {
    return { shaving: await buildShavingGuideToC(lang) };
  }

  // Personalised reports: generate via Claude in parallel where possible
  const st = skinType || "combination";

  const bioPrompt = `Write a personalised skin biology report in ${ln} for a man with ${st} skin.
600 words. 4 sections. Each section heading in ALL CAPS with a colon after it. Flowing prose paragraphs only.

YOUR SKIN BIOLOGY:
Why ${st} skin behaves the way it does at the cellular level.

THE ROOT CAUSES:
The specific biological mechanisms behind the main concerns of this skin type.

YOUR INGREDIENT SCIENCE:
Which ingredients work for this biology and why, at the molecular level.

YOUR TRAJECTORY:
What happens to this skin type with and without proper care over months and years.`;

  const routinePrompt = `Write a personalised daily routine card in ${ln} for a man with ${st} skin.
Use plain text. ALL CAPS for section headings. No markdown.

MORNING ROUTINE:
Write 4 steps. Each step: Step number, product type, exact application method, duration, clinical reason.

EVENING ROUTINE:
Write 3 steps. Each step: Step number, product type, exact method, duration, clinical reason.

YOUR GOLDEN RULES:
Write 3 rules specific to ${st} skin. One sentence each.

THE ONE THING TO REMEMBER:
One powerful sentence specific to ${st} skin.`;

  const shaveAnswers = metadata.shaveAnswers ? JSON.parse(metadata.shaveAnswers).join(", ") : "";

  const shaveBioPrompt = `Write a personalised shave biology report in ${ln} for a man with ${st} skin.
600 words. 4 sections. Each section heading in ALL CAPS with colon. Flowing prose only.

THE BIOLOGY OF YOUR SHAVING PROBLEM:
Root cause specific to this skin type and shaving profile.

THE RAZOR MECHANICS:
Why current blade type causes damage for this specific skin and beard.

THE HEALING SCIENCE:
Post-shave recovery biology for this skin type.

YOUR PROTOCOL RATIONALE:
Why the recommended approach works for this specific biological profile.`;

  const shaveCardPrompt = `Write a personalised shave protocol card in ${ln} for a man with ${st} skin.
Plain text only. ALL CAPS for section headings. No markdown.

PRE-SHAVE PROTOCOL:
3 steps. Each: step number, action, exact method, duration, clinical reason.

THE SHAVE:
3 steps. Each: step number, technique, exact instruction, dermatological reason.

POST-SHAVE RECOVERY:
3 steps. Each: step number, product type, exact method, physiological effect.

BLADE RECOMMENDATION:
Specific razor model and blade for this skin type and why.

CRITICAL RULE:
Single most important instruction for this skin type. One sentence.

WEEK ONE PROTOCOL:
Day by day guidance for the first 7 days.`;

  switch(product) {
    case "biology":
      return { biology: clean(await callClaude(bioPrompt, lang)) };
    case "routine":
      return { routine: clean(await callClaude(routinePrompt, lang)) };
    case "skin-combo": {
      const [bio, routine] = await Promise.all([
        callClaude(bioPrompt, lang),
        callClaude(routinePrompt, lang),
      ]);
      return { biology: clean(bio), routine: clean(routine) };
    }
    case "shave-biology":
      return { shaveBiology: clean(await callClaude(shaveBioPrompt, lang)) };
    case "shave-card":
      return { shaveCard: clean(await callClaude(shaveCardPrompt, lang)) };
    case "shave-combo": {
      const [bio, card] = await Promise.all([
        callClaude(shaveBioPrompt, lang),
        callClaude(shaveCardPrompt, lang),
      ]);
      return { shaveBiology: clean(bio), shaveCard: clean(card) };
    }
    default:
      return { main: "" };
  }
};

const buildShavingGuideToC = async (lang) => {
  return lang === "fr"
    ? `LA BIBLE DU RASAGE POUR HOMMES\nScience des lames, biologie cutanee et technique clinique\n\nTABLE DES MATIERES:\n\n1. Pourquoi ton rasage echoue\n2. Ce que le rasage fait vraiment a ta peau\n   Mecanisme de coupe, Pseudofolliculite de la barbe, Manteau acide\n3. Science des rasoirs: chaque type explique\n   Cartouche multi-lames, Rasoir de surete, Electrique, Rasoir droit\n4. Technique clinique de rasage phase par phase\n   Pre-rasage, Le rasage, Recuperation post-rasage\n5. Technique selon le type de barbe\n   Fine, Moyenne, Epaisse droite, Epaisse bouclée, Inégale\n6. Traiter les boutons de rasoir actifs\n7. Produits qui fonctionnent: recommandations par ingrédient\n8. Optimisation du rasoir electrique\n9. Quand consulter un dermatologue\n\nTON GUIDE COMPLET EST DANS L'APPLICATION SKINR\nAccede a ton guide complet de 5 500 mots sur getskinr.com dans la section Guides.`
    : lang === "es"
    ? `LA BIBLIA DEL AFEITADO PARA HOMBRES\nCiencia de hojas, biologia cutanea y tecnica clinica\n\nTABLA DE CONTENIDOS:\n\n1. Por que tu afeitado falla\n2. Lo que el afeitado realmente hace a tu piel\n3. Ciencia de maquinillas: cada tipo explicado\n4. Tecnica clinica de afeitado fase por fase\n5. Tecnica segun el tipo de barba\n6. Tratar los granos de afeitar activos\n7. Productos que funcionan\n8. Optimizacion de afeitadora electrica\n9. Cuando ver a un dermatologo\n\nTU GUIA COMPLETA ESTA EN LA APLICACION SKINR`
    : `THE MEN'S SHAVING BIBLE\nBlade Science, Skin Biology, and Clinical Technique\n\nTABLE OF CONTENTS:\n\n1. Why Your Shave Is Failing\n2. What Shaving Does to Your Skin\n   Mechanics of the Cut, Pseudofolliculitis Barbae, The Acid Mantle\n3. Razor Science: Every Type Explained\n   Multi-Blade Cartridge, Safety DE Razor, Electric Foil, Straight Razor\n4. Clinical Technique Phase by Phase\n   Pre-Shave, The Shave, Post-Shave Recovery\n5. Technique by Beard Type\n   Fine, Medium, Coarse Straight, Coarse Curly, Patchy\n6. Treating Active Razor Bumps\n7. Products That Work: Ingredient-Led Recommendations\n8. Electric Shaver Optimisation\n9. When to See a Dermatologist\n\nYOUR FULL GUIDE IS IN THE SKINR APP\nAccess your complete 5,500-word guide at getskinr.com under the Guides tab.`;
};

// ── BUILD PDF -- FIXED Y TRACKING ─────────────────────────────────────────────
const buildPDF = (product, content, skinType, lang) => new Promise((resolve, reject) => {
  try {
    const label = LABELS[product] || "SKINR Report";
    const doc   = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
      info: { Title: label, Author: "SKINR", Subject: "Clinical Report" },
    });

    const chunks = [];
    doc.on("data",  c => chunks.push(c));
    doc.on("end",   () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const PW = doc.page.width;   // 595
    const PH = doc.page.height;  // 842
    const M  = 50;               // margin
    const CW = PW - M * 2;      // content width = 495
    const BOTTOM_MARGIN = 70;    // space reserved for footer

    // ── BACKGROUND ───────────────────────────────────────────────────────────
    const fillBg = () => doc.rect(0, 0, PW, PH).fill(C.bg);

    // ── HEADER ───────────────────────────────────────────────────────────────
    const drawHeader = () => {
      fillBg();
      // Gold top stripe
      doc.rect(0, 0, PW, 3).fill(C.gold);
      // Header background
      doc.rect(0, 3, PW, 80).fill("#080808");
      // Diamond logo
      doc.save().translate(M, 43).rotate(45)
        .rect(-6, -6, 12, 12).fill(C.gold).restore();
      // SKINR text
      doc.font("Helvetica-Bold").fontSize(20).fillColor(C.white)
        .text("SKINR", M + 16, 34, { lineBreak: false });
      // Tagline
      doc.font("Helvetica").fontSize(7).fillColor(C.soft)
        .text("FREE. CLINICAL. BUILT FOR MEN.", M + 16, 57,
          { lineBreak: false, characterSpacing: 1.5 });
      // Website
      doc.font("Helvetica").fontSize(8).fillColor(C.gold)
        .text("getskinr.com", PW - M - 68, 43, { lineBreak: false });
      // Divider
      doc.moveTo(M, 83).lineTo(PW - M, 83).strokeColor(C.gold).lineWidth(0.5).stroke();
    };

    drawHeader();

    // ── TITLE BLOCK ──────────────────────────────────────────────────────────
    let y = 98;

    doc.font("Helvetica").fontSize(7.5).fillColor(C.gold)
      .text(label.toUpperCase(), M, y, { characterSpacing: 2.5, lineBreak: false });
    y += 18;

    if (skinType) {
      doc.font("Helvetica").fontSize(9).fillColor(C.soft)
        .text(
          lang === "fr" ? `Préparé pour: profil peau ${skinType}`
          : lang === "es" ? `Preparado para: perfil piel ${skinType}`
          : `Prepared for: ${skinType} skin profile`,
          M, y, { lineBreak: false }
        );
      y += 15;
    }

    const date = new Date().toLocaleDateString(
      lang === "fr" ? "fr-CA" : lang === "es" ? "es-MX" : "en-CA",
      { year: "numeric", month: "long", day: "numeric" }
    );
    doc.font("Helvetica").fontSize(8).fillColor(C.muted)
      .text(date, M, y, { lineBreak: false });
    y += 22;

    doc.moveTo(M, y).lineTo(PW - M, y).strokeColor(C.border).lineWidth(0.5).stroke();
    y += 16;

    // ── PAGE FOOTER ──────────────────────────────────────────────────────────
    const drawFooter = () => {
      const fy = PH - 36;
      doc.moveTo(M, fy).lineTo(PW - M, fy).strokeColor(C.border).lineWidth(0.3).stroke();
      doc.font("Helvetica").fontSize(7).fillColor(C.muted)
        .text("SKINR  --  getskinr.com  --  Clinical. Independent. Built for Men.",
          M, fy + 8, { width: CW, align: "center" });
    };
    drawFooter();

    // ── CORE RENDERING FUNCTION (FIXED Y TRACKING) ───────────────────────────
    // Key fix: use heightOfString() to know EXACTLY how tall text will be
    // before advancing Y. This prevents all overlap.
    const writeText = (text, opts = {}) => {
      if (!text || !text.trim()) return;

      const fontSize   = opts.fontSize   || 10;
      const font       = opts.font       || "Helvetica";
      const color      = opts.color      || C.soft;
      const align      = opts.align      || "left";
      const lineGap    = opts.lineGap    || 2;
      const extraAfter = opts.extraAfter || 6;
      const width      = opts.width      || CW;

      doc.font(font).fontSize(fontSize);
      const textH = doc.heightOfString(text, { width, lineGap });
      const needed = textH + extraAfter;

      // Check if we need a new page
      if (y + needed > PH - BOTTOM_MARGIN) {
        doc.addPage();
        fillBg();
        doc.rect(0, 0, PW, 2).fill(C.gold); // thin gold top on continuation pages
        drawFooter();
        y = 30;
      }

      doc.font(font).fontSize(fontSize).fillColor(color)
        .text(text, M, y, { width, align, lineGap });

      y += textH + extraAfter;
    };

    const writeSectionHeader = (title) => {
      const needed = 32;
      if (y + needed > PH - BOTTOM_MARGIN) {
        doc.addPage();
        fillBg();
        doc.rect(0, 0, PW, 2).fill(C.gold);
        drawFooter();
        y = 30;
      }
      // Dark strip with gold left border
      doc.rect(M, y, CW, 26).fill("#0D0D0D");
      doc.rect(M, y, 3, 26).fill(C.gold);
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.gold)
        .text(title.toUpperCase().replace(/:/g, ""),
          M + 12, y + 8, { lineBreak: false, characterSpacing: 1.5 });
      y += 34;
    };

    // ── RENDER CONTENT ────────────────────────────────────────────────────────
    const renderBlock = (title, text) => {
      if (!text || !text.trim()) return;
      writeSectionHeader(title);

      // Split into paragraphs on blank lines
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
      for (const para of paragraphs) {
        const lines = para.split("\n").filter(l => l.trim());
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // Detect sub-headings: ALL CAPS lines or ends with colon
          const isAllCaps = trimmed === trimmed.toUpperCase()
            && trimmed.length > 3
            && trimmed.length < 80
            && /[A-Z]/.test(trimmed);

          if (isAllCaps || trimmed.endsWith(":")) {
            writeText(trimmed, {
              font: "Helvetica-Bold",
              fontSize: 9,
              color: C.cream,
              extraAfter: 4,
            });
          } else {
            writeText(trimmed, {
              font: "Helvetica",
              fontSize: 10,
              color: C.soft,
              lineGap: 3,
              extraAfter: 8,
            });
          }
        }
        y += 4; // paragraph gap
      }
      y += 8; // section gap
    };

    // Render all content blocks
    if (content.biology)     renderBlock("Skin Biology Report", content.biology);
    if (content.routine)     renderBlock("Your Daily Routine Card", content.routine);
    if (content.shaveBiology)renderBlock("Shave Biology Report", content.shaveBiology);
    if (content.shaveCard)   renderBlock("Your Shave Protocol Card", content.shaveCard);
    if (content.skincare)    renderBlock("Men's Skincare Guide", content.skincare);
    if (content.shaving)     renderBlock("Men's Shaving Bible", content.shaving);
    if (content.main)        renderBlock(label, content.main);

    // ── DISCLAIMER ───────────────────────────────────────────────────────────
    const disclaimer = lang === "fr"
      ? "Avis médical: Ce rapport fournit des orientations cliniques générales. Consultez un dermatologue certifié pour tout problème de santé cutanée persistant."
      : lang === "es"
      ? "Aviso médico: Este informe proporciona orientación clínica general. Consulte a un dermatólogo certificado para cualquier problema de salud cutánea persistente."
      : "Medical disclaimer: This report provides general clinical guidance and is not a substitute for professional medical advice. Consult a board-certified dermatologist for persistent skin concerns.";

    const dH = doc.font("Helvetica").fontSize(7.5).heightOfString(disclaimer, { width: CW - 24 });
    if (y + dH + 28 > PH - BOTTOM_MARGIN) {
      doc.addPage();
      fillBg();
      doc.rect(0, 0, PW, 2).fill(C.gold);
      drawFooter();
      y = 30;
    }
    doc.rect(M, y, CW, dH + 20).fill("#090909");
    doc.rect(M, y, 2, dH + 20).fill(C.gold);
    doc.font("Helvetica").fontSize(7.5).fillColor(C.muted)
      .text(disclaimer, M + 12, y + 10, { width: CW - 24 });

    doc.end();

  } catch(err) {
    reject(err);
  }
});

// ── BRANDED HTML EMAIL ────────────────────────────────────────────────────────
const buildEmail = (label, skinType, lang) => {
  const headline = lang === "fr" ? "Ton rapport est prêt"
    : lang === "es" ? "Tu informe está listo"
    : "Your report is ready";
  const body1 = lang === "fr"
    ? "Ton rapport clinique personnalisé SKINR est joint à cet email en PDF. Ouvre-le sur n'importe quel appareil, sauvegarde-le, imprime-le."
    : lang === "es"
    ? "Tu informe clínico personalizado de SKINR está adjunto a este correo en PDF. Ábrelo en cualquier dispositivo, guárdalo, imprímelo."
    : "Your personalised SKINR clinical report is attached as a PDF. Open it on any device, save it, print it.";
  const body2 = lang === "fr"
    ? "Ton rapport est aussi accessible dans l'application SKINR sur skinrfinal.netlify.app. Ton achat est sauvegardé dans ton navigateur."
    : lang === "es"
    ? "Tu informe también está accesible en la aplicación SKINR en skinrfinal.netlify.app."
    : "Your report is also accessible anytime in the SKINR app at skinrfinal.netlify.app.";
  const cta = lang === "fr" ? "Ouvrir SKINR"
    : lang === "es" ? "Abrir SKINR"
    : "Open SKINR";
  const disclaimer = lang === "fr"
    ? "Les liens affiliés Amazon soutiennent ce service gratuit sans coût supplémentaire. Toutes les recommandations sont basées sur des preuves cliniques uniquement."
    : lang === "es"
    ? "Los enlaces de afiliados de Amazon apoyan este servicio gratuito sin costo adicional. Todas las recomendaciones se basan únicamente en evidencia clínica."
    : "Amazon affiliate links support this free service at no extra cost. All recommendations are based on clinical evidence only.";
  const profileLabel = lang === "fr" ? "Profil préparé pour"
    : lang === "es" ? "Perfil preparado para"
    : "Prepared for";

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0D0D0D;">
<div style="max-width:560px;margin:0 auto;background:#050505;font-family:Georgia,serif;">
<div style="height:3px;background:linear-gradient(90deg,#B8972A,#D4AF50,#B8972A);"></div>
<div style="padding:32px 36px 24px;border-bottom:1px solid #1E1A14;text-align:center;">
  <div style="font-size:9px;letter-spacing:5px;color:#B8972A;font-family:Arial,sans-serif;text-transform:uppercase;margin-bottom:10px;">Clinical Skincare</div>
  <div style="font-size:26px;font-weight:700;color:#F2EEE6;font-family:Arial,sans-serif;letter-spacing:5px;">SKINR</div>
</div>
<div style="padding:36px;">
  <div style="font-size:9px;letter-spacing:3px;color:#B8972A;font-family:Arial,sans-serif;text-transform:uppercase;margin-bottom:12px;">${headline}</div>
  <h1 style="font-size:19px;color:#F2EEE6;font-weight:700;margin:0 0 18px;line-height:1.4;">${label}</h1>
  ${skinType ? `<div style="background:#0D0D0D;border-left:3px solid #B8972A;padding:10px 14px;margin-bottom:20px;"><div style="font-size:8px;letter-spacing:3px;color:#B8972A;font-family:Arial,sans-serif;text-transform:uppercase;margin-bottom:4px;">${profileLabel}</div><div style="font-size:13px;color:#F2EEE6;">${skinType}</div></div>` : ""}
  <p style="font-size:14px;color:#D8D2C8;line-height:1.85;margin:0 0 16px;">${body1}</p>
  <p style="font-size:14px;color:#D8D2C8;line-height:1.85;margin:0 0 28px;">${body2}</p>
  <div style="text-align:center;margin:28px 0;">
    <a href="https://skinrfinal.netlify.app" style="background:#B8972A;color:#050505;padding:13px 32px;text-decoration:none;font-size:9px;letter-spacing:3px;text-transform:uppercase;font-weight:700;font-family:Arial,sans-serif;display:inline-block;">${cta}</a>
  </div>
</div>
<div style="height:1px;background:#1E1A14;margin:0 36px;"></div>
<div style="padding:20px 36px;text-align:center;">
  <p style="font-size:10px;color:#4E4844;margin:0 0 6px;font-family:Arial,sans-serif;">SKINR  --  getskinr.com</p>
  <p style="font-size:10px;color:#4E4844;margin:0;font-family:Arial,sans-serif;line-height:1.6;">${disclaimer}</p>
</div>
<div style="height:2px;background:linear-gradient(90deg,#B8972A,#D4AF50,#B8972A);"></div>
</div></body></html>`;
};

// ── SEND EMAIL ────────────────────────────────────────────────────────────────
const sendEmail = async (to, subject, html, pdfBuffer, filename) => {
  const t = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASS },
  });
  return t.sendMail({
    from: `SKINR <${process.env.GMAIL_USER}>`,
    to, subject, html,
    attachments: [{ filename, content: pdfBuffer, contentType: "application/pdf" }],
  });
};

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  // Signature verification
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig    = event.headers["stripe-signature"];
  if (secret && sig && !verify(event.body, sig, secret)) {
    console.error("Signature failed");
    return { statusCode: 400, body: "Invalid signature" };
  }

  try {
    const ev = JSON.parse(event.body);

    if (ev.type === "payment_intent.succeeded") {
      const intent   = ev.data.object;
      const { product, email, skinType, lang } = intent.metadata;
      const amount   = intent.amount / 100;
      const label    = LABELS[product] || "SKINR Report";
      const language = lang || "en"; // Use customer's language from metadata
      const filename = `SKINR-${label.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;

      console.log(`Payment: ${intent.id} | ${product} | $${amount} | ${email} | lang: ${language}`);

      if (email && process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
        try {
          // Generate content in customer's language
          const content = await generateContent(product, skinType, language, intent.metadata);

          // Build PDF
          const pdf  = await buildPDF(product, content, skinType, language);
          const html = buildEmail(label, skinType, language);
          const subj = language === "fr" ? `Votre SKINR ${label}`
                     : language === "es" ? `Su SKINR ${label}`
                     : `Your SKINR ${label}`;

          // Send to customer
          await sendEmail(email, subj, html, pdf, filename);
          console.log(`Delivered to ${email}`);

          // Owner notification
          await nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASS },
          }).sendMail({
            from:    `SKINR <${process.env.GMAIL_USER}>`,
            to:      process.env.GMAIL_USER,
            subject: `[SKINR Sale] ${label} -- $${amount} -- ${email}`,
            html:    `<p style="font-family:Arial;font-size:14px;line-height:1.8">
              <strong>New SKINR purchase</strong><br>
              Product: <strong>${label}</strong><br>
              Amount: <strong>$${amount} USD</strong><br>
              Customer: <strong>${email}</strong><br>
              Language: ${language}<br>
              Skin type: ${skinType || "not provided"}<br>
              Payment ID: ${intent.id}<br>
              Time: ${new Date().toISOString()}
            </p>`,
          });

        } catch(err) {
          console.error("Delivery error:", err.message);
          // Never return non-200 -- Stripe would retry and double-charge
        }
      }
    }

    if (ev.type === "payment_intent.payment_failed") {
      const intent = ev.data.object;
      console.error(`Failed: ${intent.id} -- ${intent.last_payment_error?.message}`);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch(err) {
    console.error("Handler error:", err.message);
    return { statusCode: 400, body: "Error" };
  }
};
