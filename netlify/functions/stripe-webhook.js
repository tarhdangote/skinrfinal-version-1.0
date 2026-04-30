/**
 * SKINR -- Stripe Webhook + Branded PDF Generation + Gmail Delivery
 * netlify/functions/stripe-webhook.js
 *
 * Generates a luxury branded PDF for every purchase and emails it
 * to the customer within 60 seconds of payment confirmation.
 *
 * Design: Black background, gold accents, Helvetica typography.
 * Matches the SKINR brand aesthetic.
 */

const crypto     = require("crypto");
const https      = require("https");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

// ── BRAND COLOURS ─────────────────────────────────────────────────────────────
const BRAND = {
  black:  "#050505",
  card:   "#0D0D0D",
  gold:   "#B8972A",
  gold2:  "#D4AF50",
  white:  "#F2EEE6",
  cream:  "#D8D2C8",
  soft:   "#B8AEA6",
  muted:  "#4E4844",
  border: "#1E1A14",
};

// ── PRODUCT LABELS ─────────────────────────────────────────────────────────────
const PRODUCT_LABELS = {
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

const PRODUCT_PRICES = {
  "biology": 15, "routine": 12, "skin-combo": 22,
  "shave-biology": 15, "shave-card": 12, "shave-combo": 22,
  "skincare-guide": 9, "shaving-guide": 9, "guides-combo": 15,
};

// ── VERIFY STRIPE SIGNATURE ───────────────────────────────────────────────────
const verifyStripeSignature = (payload, signature, secret) => {
  const parts      = signature.split(",");
  const timestamp  = parts.find(p => p.startsWith("t="))?.split("=")[1];
  const signatures = parts.filter(p => p.startsWith("v1=")).map(p => p.split("=")[1]);
  if (!timestamp || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 300) return false;
  const expected = crypto.createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8").digest("hex");
  return signatures.some(sig => {
    try { return crypto.timingSafeEqual(Buffer.from(sig,"hex"), Buffer.from(expected,"hex")); }
    catch(_) { return false; }
  });
};

// ── CALL CLAUDE ───────────────────────────────────────────────────────────────
const callClaude = (prompt) => new Promise((resolve, reject) => {
  const body = JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2500,
    messages: [{ role: "user", content: prompt }],
  });
  const req = https.request({
    hostname: "api.anthropic.com", path: "/v1/messages", method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
  }, (res) => {
    let data = "";
    res.on("data", c => data += c);
    res.on("end", () => {
      try { resolve(JSON.parse(data).content?.[0]?.text || ""); }
      catch(e) { resolve(""); }
    });
  });
  req.on("error", reject);
  req.write(body);
  req.end();
});

// ── GENERATE REPORT CONTENT ───────────────────────────────────────────────────
const generateContent = async (product, skinType) => {
  const isGuide = product.includes("guide");

  if (isGuide) {
    const skincareToC = `THE NO-BS MEN'S SKINCARE GUIDE
A Clinical Reference for Every Skin Type, Every Ingredient, and Every Routine

TABLE OF CONTENTS

1. Why Most Men's Skin Routines Fail
2. The Biology You Need to Know
   The Skin Barrier / Sebum Production / Cellular Turnover / The pH Factor
3. Skin Types — Clinical Definitions
   Dry / Oily / Combination / Sensitive / Acne-Prone
4. The Ingredient Guide — What Actually Works
   Niacinamide / Retinol / Salicylic Acid / Hyaluronic Acid /
   Vitamin C / Ceramides / AHAs / Benzoyl Peroxide / SPF
5. Building Your Routine — Morning and Evening
6. How to Read a Product Label
7. The Most Common Mistakes Men Make
8. Hyperpigmentation and Dark Spots
9. When to See a Dermatologist

YOUR COMPLETE GUIDE IS IN THE SKINR APP
Your full 5,000-word guide is accessible at getskinr.com under the Guides tab.
Your purchase is permanently saved to your browser.`;

    const shavingToC = `THE MEN'S SHAVING BIBLE
Blade Science, Skin Biology, and Clinical Technique

TABLE OF CONTENTS

1. Why Your Shave Is Failing
2. What Shaving Does to Your Skin
   Mechanics of the Cut / Pseudofolliculitis Barbae / The Acid Mantle
3. Razor Science — Every Type Explained
   Multi-Blade Cartridge / Safety DE Razor / Electric Foil / Straight Razor
4. Clinical Shaving Technique — Phase by Phase
   Pre-Shave / The Shave / Post-Shave Recovery Protocol
5. Technique by Beard Type
   Fine Straight / Medium / Coarse Straight / Coarse Curly / Patchy
6. Treating Active Razor Bumps — Clinical Protocol
7. Products That Work — Ingredient-Led Recommendations
8. Electric Shaver Optimisation
9. When to See a Dermatologist

YOUR COMPLETE GUIDE IS IN THE SKINR APP
Your full 5,500-word guide is accessible at getskinr.com under the Guides tab.`;

    if (product === "guides-combo") return { skincare: skincareToC, shaving: shavingToC };
    if (product === "skincare-guide") return { skincare: skincareToC };
    if (product === "shaving-guide") return { shaving: shavingToC };
  }

  const prompts = {
    "biology": `Clinical dermatologist writing a personalised skin biology report.
Skin type: ${skinType || "combination skin"}.
Write 600-800 words in 4 sections with clear headings:
SECTION 1 — YOUR SKIN BIOLOGY: Why this skin type behaves the way it does at a cellular level.
SECTION 2 — THE ROOT CAUSES: The specific biological mechanisms driving the main concerns.
SECTION 3 — YOUR INGREDIENT SCIENCE: What ingredients work for this biology and why, at the molecular level.
SECTION 4 — YOUR TRAJECTORY: What happens to this skin type over time with and without proper care.
Write in clinical but accessible language. Use paragraphs. Address reader directly.`,

    "routine": `Clinical dermatologist writing a personalised daily routine card.
Skin type: ${skinType || "combination skin"}.
Format exactly as:
MORNING ROUTINE
Step 1 — [Product type]: [Exact application method]. [Timing]. [Clinical reason].
Step 2 — [Product type]: [Exact application method]. [Timing]. [Clinical reason].
Step 3 — [Product type]: [Exact application method]. [Timing]. [Clinical reason].
Step 4 — SPF: [Application]. [Why non-negotiable].

EVENING ROUTINE
Step 1 — [Product type]: [Exact method]. [Timing]. [Clinical reason].
Step 2 — [Product type]: [Exact method]. [Timing]. [Clinical reason].
Step 3 — [Product type]: [Exact method]. [Timing]. [Clinical reason].

YOUR GOLDEN RULES
Rule 1: [Specific to this skin type]
Rule 2: [Specific to this skin type]
Rule 3: [Specific to this skin type]

THE ONE THING TO REMEMBER
[One powerful sentence specific to this skin type]`,

    "shave-biology": `Shaving dermatologist writing a personalised shave biology report.
Skin type: ${skinType || "combination skin"}.
Write 600-800 words in 4 sections:
SECTION 1 — THE BIOLOGY OF YOUR SHAVING PROBLEM: Root cause at the cellular level.
SECTION 2 — THE RAZOR MECHANICS: Why specific blade types cause damage for this skin profile.
SECTION 3 — THE HEALING SCIENCE: Post-shave recovery biology for this skin type.
SECTION 4 — YOUR PROTOCOL RATIONALE: Why the recommended approach works for this specific biology.`,

    "shave-card": `Shaving dermatologist writing a personalised shave protocol card.
Skin type: ${skinType || "combination skin"}.
Format exactly as:
PRE-SHAVE PROTOCOL
Step 1 — [Action]: [Exact method]. Duration: [time]. Why: [physiological reason].
Step 2 — [Action]: [Exact method]. Duration: [time]. Why: [physiological reason].
Step 3 — [Product]: [Application]. Duration: [time]. Why: [physiological reason].

THE SHAVE
Step 1 — [Direction and technique]: [Exact instruction]. Why: [dermatological reason].
Step 2 — [Rinse protocol]: [Exact instruction]. Why: [reason].
Step 3 — [Final pass if needed]: [Exact instruction]. Why: [reason].

POST-SHAVE RECOVERY
Step 1 — [Action]: [Exact product and method]. Why: [physiological effect].
Step 2 — [Treatment]: [Exact product and method]. Why: [physiological effect].
Step 3 — [Moisturiser]: [Exact product and amount]. Why: [physiological effect].

BLADE RECOMMENDATION
Recommended: [Specific razor model]
Why: [Clinical reason for this skin type]
Blade: [Specific blade brand and why]

CRITICAL RULE
[The single most important instruction for this skin type — one sentence]

WEEK ONE PROTOCOL
[Day by day guidance for days 1 through 7]`,
  };

  if (product === "skin-combo") {
    const [bio, card] = await Promise.all([
      callClaude(prompts["biology"]),
      callClaude(prompts["routine"]),
    ]);
    return { biology: bio, routine: card };
  }
  if (product === "shave-combo") {
    const [bio, card] = await Promise.all([
      callClaude(prompts["shave-biology"]),
      callClaude(prompts["shave-card"]),
    ]);
    return { shaveBiology: bio, shaveCard: card };
  }

  const text = await callClaude(prompts[product] || prompts["biology"]);
  return { main: text };
};

// ── BUILD BRANDED PDF ─────────────────────────────────────────────────────────
const buildPDF = (product, content, skinType, email) => new Promise((resolve, reject) => {
  try {
    const doc    = new PDFDocument({ size: "A4", margin: 0, info: {
      Title:   PRODUCT_LABELS[product] || "SKINR Report",
      Author:  "SKINR",
      Subject: "Clinical Skincare Report",
    }});
    const chunks = [];
    doc.on("data",  c => chunks.push(c));
    doc.on("end",   () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W  = doc.page.width;   // 595
    const M  = 48;               // margin
    const CW = W - M * 2;       // content width

    // Helper: hex to RGB
    const hex = (h) => {
      const r = parseInt(h.slice(1,3),16);
      const g = parseInt(h.slice(3,5),16);
      const b = parseInt(h.slice(5,7),16);
      return [r,g,b];
    };

    // ── PAGE BACKGROUND ─────────────────────────────────────────────────────
    const drawBackground = () => {
      doc.rect(0, 0, W, doc.page.height).fill(BRAND.black);
    };
    drawBackground();

    // ── HEADER ──────────────────────────────────────────────────────────────
    // Gold top bar
    doc.rect(0, 0, W, 4).fill(BRAND.gold);

    // Logo area background
    doc.rect(0, 4, W, 88).fill("#080808");

    // Gold diamond
    doc.save()
      .translate(M, 48)
      .rotate(45)
      .rect(-7, -7, 14, 14)
      .fill(BRAND.gold)
      .restore();

    // SKINR wordmark
    doc.font("Helvetica-Bold")
      .fontSize(22)
      .fillColor(BRAND.white)
      .text("SKINR", M + 18, 37, { lineBreak: false });

    // Tagline
    doc.font("Helvetica")
      .fontSize(7.5)
      .fillColor(BRAND.soft)
      .text("FREE. CLINICAL. BUILT FOR MEN.", M + 18, 62, { lineBreak: false, characterSpacing: 2 });

    // Website top-right
    doc.font("Helvetica")
      .fontSize(8)
      .fillColor(BRAND.gold)
      .text("getskinr.com", W - M - 70, 46, { lineBreak: false });

    // Gold divider line
    doc.rect(M, 96, CW, 0.5).fill(BRAND.gold);

    // ── REPORT TITLE BLOCK ───────────────────────────────────────────────────
    let y = 116;

    // Label
    doc.font("Helvetica")
      .fontSize(8)
      .fillColor(BRAND.gold)
      .text((PRODUCT_LABELS[product] || "SKINR Report").toUpperCase(),
        M, y, { characterSpacing: 3, lineBreak: false });
    y += 22;

    // Skin type if present
    if (skinType) {
      doc.font("Helvetica")
        .fontSize(10)
        .fillColor(BRAND.soft)
        .text(`Prepared for: ${skinType} skin profile`, M, y);
      y += 18;
    }

    // Date
    const date = new Date().toLocaleDateString("en-CA", {
      year: "numeric", month: "long", day: "numeric"
    });
    doc.font("Helvetica")
      .fontSize(9)
      .fillColor(BRAND.muted)
      .text(date, M, y);
    y += 28;

    // Thin gold rule
    doc.rect(M, y, CW, 0.5).fill(BRAND.gold);
    y += 20;

    // ── CONTENT RENDERER ────────────────────────────────────────────────────
    const addPage = () => {
      doc.addPage();
      drawBackground();
      // Gold top bar on new pages
      doc.rect(0, 0, W, 2).fill(BRAND.gold);
      // Small footer on each page
      doc.font("Helvetica").fontSize(7).fillColor(BRAND.muted)
        .text("SKINR -- getskinr.com", M, doc.page.height - 28, {
          width: CW, align: "center"
        });
      return 32;
    };

    const checkY = (needed = 40) => {
      if (y + needed > doc.page.height - 60) {
        y = addPage();
      }
    };

    const writeSection = (title, body) => {
      checkY(60);

      // Section title background strip
      doc.rect(M, y, CW, 24).fill("#111008");
      doc.rect(M, y, 3, 24).fill(BRAND.gold);

      doc.font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(BRAND.gold)
        .text(title.toUpperCase(), M + 12, y + 7, {
          characterSpacing: 1.5, lineBreak: false
        });
      y += 34;

      // Body text -- split by newlines, handle paragraphs
      const lines = body.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) { y += 8; continue; }

        // Sub-headings (ALL CAPS lines or lines ending with :)
        const isSubhead = (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 80)
          || trimmed.endsWith(":");

        checkY(isSubhead ? 30 : 22);

        if (isSubhead) {
          doc.font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(BRAND.cream)
            .text(trimmed, M, y, { width: CW });
          y += doc.currentLineHeight() + 6;
        } else {
          doc.font("Helvetica")
            .fontSize(10)
            .fillColor(BRAND.soft)
            .text(trimmed, M, y, { width: CW, lineGap: 3 });
          y += doc.currentLineHeight() + 8;
        }
      }
      y += 12;
    };

    // ── WRITE CONTENT BASED ON PRODUCT ──────────────────────────────────────
    if (content.biology)     writeSection("Skin Biology Report", content.biology);
    if (content.routine)     writeSection("Your Daily Routine Card", content.routine);
    if (content.shaveBiology)writeSection("Shave Biology Report", content.shaveBiology);
    if (content.shaveCard)   writeSection("Your Shave Protocol Card", content.shaveCard);
    if (content.skincare)    writeSection("Men's Skincare Guide", content.skincare);
    if (content.shaving)     writeSection("Men's Shaving Bible", content.shaving);
    if (content.main)        writeSection(PRODUCT_LABELS[product] || "Your Report", content.main);

    // ── DISCLAIMER BOX ───────────────────────────────────────────────────────
    checkY(80);
    y += 10;
    doc.rect(M, y, CW, 56).fill("#0A0A0A").stroke(BRAND.border);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(BRAND.gold)
      .text("MEDICAL DISCLAIMER", M + 12, y + 10, { characterSpacing: 1.5 });
    doc.font("Helvetica").fontSize(7.5).fillColor(BRAND.muted)
      .text(
        "This report provides general clinical guidance and is not a substitute for professional medical advice. " +
        "Consult a board-certified dermatologist for persistent skin conditions, severe acne, or any skin concern " +
        "that does not respond to the protocols above.",
        M + 12, y + 24, { width: CW - 24, lineGap: 2 }
      );
    y += 70;

    // ── FOOTER ───────────────────────────────────────────────────────────────
    checkY(60);
    doc.rect(M, y, CW, 0.5).fill(BRAND.border);
    y += 16;

    doc.font("Helvetica-Bold").fontSize(9).fillColor(BRAND.gold)
      .text("SKINR", M, y, { lineBreak: false });
    doc.font("Helvetica").fontSize(9).fillColor(BRAND.muted)
      .text("  --  Free. Clinical. Built for Men.  --  getskinr.com", M + 36, y);
    y += 18;

    doc.font("Helvetica").fontSize(7.5).fillColor(BRAND.muted)
      .text(
        "Amazon affiliate links support this free service at no extra cost to you. " +
        "All recommendations are based solely on clinical evidence and your skin profile. " +
        "No brand pays for placement in SKINR.",
        M, y, { width: CW, lineGap: 2 }
      );

    doc.end();

  } catch(err) {
    reject(err);
  }
});

// ── BRANDED HTML EMAIL ────────────────────────────────────────────────────────
const buildEmailHtml = (label, skinType, product) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your SKINR Report</title></head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:Georgia,serif;">
<div style="max-width:580px;margin:0 auto;background:#050505;border:1px solid #1E1A14;">

  <!-- Gold top bar -->
  <div style="height:3px;background:linear-gradient(90deg,#B8972A,#D4AF50,#B8972A);"></div>

  <!-- Header -->
  <div style="padding:36px 40px 28px;border-bottom:1px solid #1E1A14;text-align:center;">
    <div style="display:inline-flex;align-items:center;gap:10px;">
      <div style="width:10px;height:10px;background:#B8972A;transform:rotate(45deg);"></div>
      <span style="font-family:Arial,sans-serif;font-size:22px;font-weight:700;
        color:#F2EEE6;letter-spacing:5px;">SKINR</span>
    </div>
    <div style="font-size:9px;letter-spacing:3px;color:#B8AEA6;margin-top:6px;
      font-family:Arial,sans-serif;text-transform:uppercase;">
      Free. Clinical. Built for Men.
    </div>
  </div>

  <!-- Body -->
  <div style="padding:40px;">
    <div style="font-size:9px;letter-spacing:4px;color:#B8972A;
      font-family:Arial,sans-serif;text-transform:uppercase;margin-bottom:14px;">
      Your Report Is Ready
    </div>
    <h1 style="font-size:20px;color:#F2EEE6;font-weight:700;margin:0 0 20px;line-height:1.3;">
      ${label}
    </h1>
    ${skinType ? `
    <div style="background:#0D0D0D;border-left:3px solid #B8972A;padding:12px 16px;margin-bottom:24px;">
      <div style="font-size:9px;letter-spacing:3px;color:#B8972A;font-family:Arial,sans-serif;
        text-transform:uppercase;margin-bottom:4px;">Generated For</div>
      <div style="font-size:14px;color:#F2EEE6;">${skinType} skin profile</div>
    </div>` : ""}

    <p style="font-size:14px;color:#D8D2C8;line-height:1.85;margin:0 0 20px;">
      Your personalised clinical report is attached to this email as a PDF.
      Open it on any device — save it, print it, keep it.
    </p>
    <p style="font-size:14px;color:#D8D2C8;line-height:1.85;margin:0 0 32px;">
      Your report is also accessible anytime in the SKINR app at
      <a href="https://skinrfinal.netlify.app" style="color:#B8972A;text-decoration:none;">
        skinrfinal.netlify.app
      </a>
      under your results — your purchase is permanently saved.
    </p>

    <!-- CTA Button -->
    <div style="text-align:center;margin:32px 0;">
      <a href="https://skinrfinal.netlify.app"
        style="background:#B8972A;color:#050505;padding:14px 36px;
          text-decoration:none;font-size:9px;letter-spacing:3px;
          text-transform:uppercase;font-weight:700;font-family:Arial,sans-serif;
          display:inline-block;">
        Open SKINR
      </a>
    </div>
  </div>

  <!-- Divider -->
  <div style="height:1px;background:#1E1A14;margin:0 40px;"></div>

  <!-- Footer -->
  <div style="padding:24px 40px;text-align:center;">
    <p style="font-size:10px;color:#4E4844;margin:0 0 8px;font-family:Arial,sans-serif;">
      SKINR -- getskinr.com -- hello@getskinr.com
    </p>
    <p style="font-size:10px;color:#4E4844;margin:0;font-family:Arial,sans-serif;line-height:1.6;">
      Amazon affiliate links support this free service at no extra cost to you.<br>
      All recommendations are based solely on clinical evidence and your skin profile.
    </p>
  </div>

  <!-- Gold bottom bar -->
  <div style="height:2px;background:linear-gradient(90deg,#B8972A,#D4AF50,#B8972A);"></div>

</div>
</body></html>`;

// ── SEND EMAIL ────────────────────────────────────────────────────────────────
const sendEmail = async (to, subject, html, pdfBuffer, filename) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASS },
  });
  return transporter.sendMail({
    from:    `SKINR <${process.env.GMAIL_USER}>`,
    to, subject, html,
    attachments: [{
      filename,
      content:     pdfBuffer,
      contentType: "application/pdf",
    }],
  });
};

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Verify Stripe signature
  const secret    = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = event.headers["stripe-signature"];
  if (secret && signature) {
    if (!verifyStripeSignature(event.body, signature, secret)) {
      console.error("Webhook signature failed");
      return { statusCode: 400, body: "Invalid signature" };
    }
  }

  try {
    const webhookEvent = JSON.parse(event.body);

    if (webhookEvent.type === "payment_intent.succeeded") {
      const intent   = webhookEvent.data.object;
      const { product, email, skinType } = intent.metadata;
      const amount   = intent.amount / 100;
      const label    = PRODUCT_LABELS[product] || "SKINR Report";
      const filename = `SKINR-${(label).replace(/[^a-zA-Z0-9]/g,"-")}.pdf`;

      console.log(`Payment: ${intent.id} | ${product} | $${amount} | ${email}`);

      if (email && process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
        try {
          // Generate content via Claude
          console.log("Generating report content...");
          const content = await generateContent(product, skinType);

          // Build branded PDF
          console.log("Building PDF...");
          const pdfBuffer = await buildPDF(product, content, skinType, email);

          // Build email
          const html    = buildEmailHtml(label, skinType, product);
          const subject = `Your SKINR ${label}`;

          // Send to customer
          await sendEmail(email, subject, html, pdfBuffer, filename);
          console.log(`PDF emailed to ${email}`);

          // Owner notification (no attachment -- just the alert)
          const owner = process.env.GMAIL_USER;
          await nodemailer.createTransport({
            service: "gmail",
            auth: { user: owner, pass: process.env.GMAIL_APP_PASS },
          }).sendMail({
            from:    `SKINR <${owner}>`,
            to:      owner,
            subject: `[SKINR Sale] ${label} -- $${amount} -- ${email}`,
            html:    `<p style="font-family:Arial;font-size:14px;">
              <strong>New SKINR purchase</strong><br><br>
              Product: <strong>${label}</strong><br>
              Amount: <strong>$${amount} USD</strong><br>
              Customer: <strong>${email}</strong><br>
              Skin type: ${skinType || "not provided"}<br>
              Payment ID: ${intent.id}<br>
              Time: ${new Date().toISOString()}
            </p>`,
          });
          console.log("Owner notified");

        } catch(emailErr) {
          console.error("Delivery error:", emailErr.message);
          // Do not return non-200 -- Stripe would retry
        }
      }
    }

    if (webhookEvent.type === "payment_intent.payment_failed") {
      const intent = webhookEvent.data.object;
      console.error(`Payment failed: ${intent.id} -- ${intent.last_payment_error?.message}`);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch(err) {
    console.error("Webhook error:", err.message);
    return { statusCode: 400, body: "Webhook error" };
  }
};
