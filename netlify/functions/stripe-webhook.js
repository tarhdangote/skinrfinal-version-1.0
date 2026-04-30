/**
 * SKINR -- Stripe Webhook Handler + PDF Generation + Email Delivery
 * netlify/functions/stripe-webhook.js
 *
 * Flow:
 * 1. Stripe fires payment_intent.succeeded
 * 2. We verify the signature (HMAC-SHA256)
 * 3. We generate a PDF of the purchased report using plain text formatting
 * 4. We send the PDF to the customer via Gmail SMTP
 * 5. We send a copy notification to the owner
 */

const crypto = require("crypto");
const https  = require("https");
const nodemailer = require("nodemailer");

// ── PRODUCT LABELS ────────────────────────────────────────────────────────────
const PRODUCT_LABELS = {
  "biology":        "Skin Biology Report",
  "routine":        "Personalised Routine Card",
  "skin-combo":     "Skin Analysis Bundle (Biology Report + Routine Card)",
  "shave-biology":  "Shave Biology Report",
  "shave-card":     "Shave Protocol Card",
  "shave-combo":    "Shave Protocol Bundle",
  "skincare-guide": "The No-BS Men's Skincare Guide",
  "shaving-guide":  "The Men's Shaving Bible",
  "guides-combo":   "Both SKINR Guides",
};

// ── VERIFY STRIPE SIGNATURE ───────────────────────────────────────────────────
const verifyStripeSignature = (payload, signature, secret) => {
  const parts     = signature.split(",");
  const timestamp = parts.find(p => p.startsWith("t="))?.split("=")[1];
  const signatures = parts.filter(p => p.startsWith("v1=")).map(p => p.split("=")[1]);
  if (!timestamp || signatures.length === 0) return false;

  // Replay attack prevention -- reject events older than 5 minutes
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 300) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");

  return signatures.some(sig => {
    try {
      return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
    } catch (_) { return false; }
  });
};

// ── CALL CLAUDE API to generate personalised report content ───────────────────
const callClaude = (prompt) => new Promise((resolve, reject) => {
  const body = JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const req = https.request({
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
  }, (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        resolve(parsed.content?.[0]?.text || "");
      } catch (e) { resolve(""); }
    });
  });
  req.on("error", reject);
  req.write(body);
  req.end();
});

// ── BUILD PDF TEXT CONTENT ────────────────────────────────────────────────────
// Creates a clean plain-text formatted document
// When we upgrade to full PDF library this function stays the same
const buildPdfText = (product, reportContent, skinType, email) => {
  const date = new Date().toLocaleDateString("en-CA", {
    year: "numeric", month: "long", day: "numeric"
  });
  const label = PRODUCT_LABELS[product] || "SKINR Report";

  return `
SKINR
Clinical Skincare & Shaving Platform for Men
getskinr.com
================================================================

${label.toUpperCase()}
Generated: ${date}
${skinType ? `Skin Profile: ${skinType}` : ""}
${email ? `Prepared for: ${email}` : ""}

================================================================
IMPORTANT: This report contains clinical guidance generated
specifically for your profile. It is not a substitute for
professional medical advice. Consult a dermatologist for
any persistent skin or shaving concerns.
================================================================

${reportContent}

================================================================
SKINR -- Free. Clinical. Built for Men.
getskinr.com | hello@getskinr.com

Amazon affiliate links in SKINR support this free service
at no extra cost to you. Recommendations are based solely
on clinical evidence and your profile -- no brand pays for
placement.
================================================================
`.trim();
};

// ── GENERATE REPORT CONTENT VIA CLAUDE ───────────────────────────────────────
const generateReportContent = async (product, skinType, metadata) => {
  const isGuide = product.includes("guide");
  if (isGuide) {
    // Guides are static -- return a professional intro + table of contents
    if (product === "skincare-guide" || product === "guides-combo") {
      return `THE NO-BS MEN'S SKINCARE GUIDE
A Clinical Reference for Every Skin Type, Every Ingredient, and Every Routine

TABLE OF CONTENTS
1. Why Most Men's Skin Routines Fail
2. The Biology You Actually Need to Know
   -- The Skin Barrier
   -- Sebum and Oil Production
   -- Cellular Turnover
   -- The pH Factor
3. Skin Types -- Clinical Definitions
   -- Dry, Oily, Combination, Sensitive, Acne-Prone
4. The Ingredient Guide -- What Actually Works
   -- Niacinamide, Retinol, Salicylic Acid, Hyaluronic Acid
   -- Vitamin C, Ceramides, AHAs, Benzoyl Peroxide, SPF
5. Building Your Routine -- Morning and Evening
6. How to Read a Product Label
7. The Most Common Mistakes Men Make
8. Hyperpigmentation and Dark Spots
9. When to See a Dermatologist

ACCESS YOUR FULL GUIDE
Your complete guide is available in the SKINR app at getskinr.com.
Sign in and go to the Guides section -- your purchase is saved to your account.
The full guide contains approximately 5,000 words of clinical reference material
covering every topic in the table of contents above in complete detail.

For any questions about your guide contact hello@getskinr.com`;
    }
    if (product === "shaving-guide" || product === "guides-combo") {
      return `THE MEN'S SHAVING BIBLE
Blade Science, Skin Biology, and Clinical Technique

TABLE OF CONTENTS
1. Why Your Shave Is Failing
2. What Shaving Actually Does to Your Skin
   -- The Mechanics of the Cut
   -- Pseudofolliculitis Barbae (Razor Bumps) -- The Clinical Facts
   -- The Acid Mantle and Shaving
3. Razor Science -- Every Type Explained
   -- Multi-Blade Cartridge, Safety/DE, Electric, Straight, OneBlade
4. Clinical Shaving Technique Phase by Phase
   -- Pre-Shave, The Shave, Post-Shave
5. Technique by Beard Type
   -- Fine, Medium, Coarse Straight, Coarse Curly, Patchy
6. Treating Active Razor Bumps -- Clinical Protocol
7. Products That Work -- Ingredient-Led Recommendations
8. Electric Shaver Optimisation
9. When to See a Dermatologist

ACCESS YOUR FULL GUIDE
Your complete guide is available in the SKINR app at getskinr.com.
The full guide contains approximately 5,500 words of clinical reference material.

For any questions contact hello@getskinr.com`;
    }
  }

  // Personalised reports -- generate via Claude
  const prompts = {
    "biology": `You are a clinical dermatologist writing a personalised skin biology report. 
Skin type: ${skinType || "combination"}. 
Write a comprehensive 800-word clinical biology report explaining:
1. Why this specific skin type behaves the way it does at a cellular level
2. The biological mechanism behind the main concerns for this skin type
3. What specific ingredients work for this biology and why (molecular mechanism)
4. The long-term trajectory of this skin type with and without proper care
5. Three non-obvious insights specific to this skin type

Write in clear, clinical but accessible language. No bullet points -- use paragraphs.
Address the reader directly as "your skin".`,

    "routine": `You are a clinical dermatologist writing a personalised daily routine card.
Skin type: ${skinType || "combination"}.
Write a complete morning and evening routine:

MORNING ROUTINE
List 4-5 steps with: product type, exact application method, timing, and clinical reason.

EVENING ROUTINE  
List 3-4 steps with: product type, exact application method, timing, and clinical reason.

GOLDEN RULES (3 rules specific to this skin type)

THE ONE THING TO REMEMBER (one powerful sentence)

Be specific and clinical. No generic advice.`,

    "shave-biology": `You are a shaving dermatologist writing a personalised shave biology report.
Skin type: ${skinType || "combination"}.
Write a comprehensive 800-word clinical report explaining:
1. The biological reason shaving causes problems for this skin type
2. The cellular mechanism of razor bumps and irritation for this profile
3. Why specific blade types cause more damage for this skin biology
4. The post-shave recovery biology specific to this skin type
5. The long-term skin trajectory with correct vs incorrect shaving technique

Write in clinical but accessible language. Use paragraphs not bullet points.`,

    "shave-card": `You are a shaving dermatologist writing a personalised shave protocol card.
Skin type: ${skinType || "combination"}.

PRE-SHAVE PROTOCOL (3 steps with timing and clinical reason)

THE SHAVE (3 steps with exact technique and why)

POST-SHAVE PROTOCOL (3 steps with products and clinical reason)

BLADE RECOMMENDATION (specific razor type and model for this skin type)

CRITICAL RULE (the single most important thing for this skin type)

WEEK ONE PROTOCOL (day by day guidance for the first 7 days)

Be specific. Mention actual products by name.`,
  };

  // For combos, generate both reports
  if (product === "skin-combo") {
    const bio = await callClaude(prompts["biology"]);
    const card = await callClaude(prompts["routine"]);
    return `PART 1: SKIN BIOLOGY REPORT\n${"=".repeat(60)}\n${bio}\n\nPART 2: PERSONALISED ROUTINE CARD\n${"=".repeat(60)}\n${card}`;
  }
  if (product === "shave-combo") {
    const bio = await callClaude(prompts["shave-biology"]);
    const card = await callClaude(prompts["shave-card"]);
    return `PART 1: SHAVE BIOLOGY REPORT\n${"=".repeat(60)}\n${bio}\n\nPART 2: SHAVE PROTOCOL CARD\n${"=".repeat(60)}\n${card}`;
  }

  const prompt = prompts[product];
  if (!prompt) return `Your ${PRODUCT_LABELS[product] || "SKINR report"} is ready. Access it at getskinr.com`;
  return await callClaude(prompt);
};

// ── SEND EMAIL VIA GMAIL SMTP ─────────────────────────────────────────────────
const sendEmail = async (to, subject, htmlBody, textContent, filename) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  const mailOptions = {
    from:    `SKINR <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html:    htmlBody,
    text:    textContent,
    attachments: [{
      filename,
      content:     Buffer.from(textContent, "utf-8"),
      contentType: "text/plain", // Plain text now -- PDF when we upgrade
    }],
  };

  return transporter.sendMail(mailOptions);
};

// ── BUILD HTML EMAIL BODY ─────────────────────────────────────────────────────
const buildEmailHtml = (product, skinType, label) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Georgia',serif;">
  <div style="max-width:600px;margin:0 auto;background:#0A0A0A;border:1px solid #2A2218;">
    <!-- Header -->
    <div style="background:#050505;padding:32px 40px;border-bottom:1px solid #B8972A;text-align:center;">
      <div style="font-size:11px;letter-spacing:6px;color:#B8972A;text-transform:uppercase;margin-bottom:8px;">Clinical Skincare</div>
      <div style="font-size:28px;font-weight:700;color:#F2EEE6;letter-spacing:4px;">SKINR</div>
    </div>
    <!-- Body -->
    <div style="padding:40px;">
      <div style="font-size:11px;letter-spacing:4px;color:#B8972A;text-transform:uppercase;margin-bottom:12px;">Your Report is Ready</div>
      <h1 style="font-size:22px;color:#F2EEE6;font-weight:700;margin:0 0 20px 0;">${label}</h1>
      ${skinType ? `<p style="font-size:14px;color:#B8AEA6;margin:0 0 20px 0;">Generated for: <strong style="color:#F2EEE6;">${skinType}</strong> skin profile</p>` : ""}
      <p style="font-size:15px;color:#D8D2C8;line-height:1.8;margin:0 0 24px 0;">
        Your personalised clinical report is attached to this email as a text file. 
        Open it on any device to access your complete protocol.
      </p>
      <p style="font-size:15px;color:#D8D2C8;line-height:1.8;margin:0 0 32px 0;">
        You can also access your report anytime at 
        <a href="https://getskinr.com" style="color:#B8972A;">getskinr.com</a> 
        -- your purchase is saved to your browser.
      </p>
      <!-- CTA -->
      <div style="text-align:center;margin:32px 0;">
        <a href="https://getskinr.com" style="background:#B8972A;color:#050505;padding:14px 32px;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700;display:inline-block;">
          Open SKINR
        </a>
      </div>
    </div>
    <!-- Footer -->
    <div style="padding:24px 40px;border-top:1px solid #1A1A1A;text-align:center;">
      <p style="font-size:11px;color:#4E4844;margin:0 0 8px 0;">
        SKINR -- Free. Clinical. Built for Men.
      </p>
      <p style="font-size:11px;color:#4E4844;margin:0;">
        Amazon affiliate links support this free service at no extra cost to you.
        All recommendations are based solely on clinical evidence and your profile.
      </p>
    </div>
  </div>
</body>
</html>`;

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Verify Stripe signature
  const webhookSecret  = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSignature = event.headers["stripe-signature"];

  if (webhookSecret && stripeSignature) {
    const isValid = verifyStripeSignature(event.body, stripeSignature, webhookSecret);
    if (!isValid) {
      console.error("Webhook signature verification failed");
      return { statusCode: 400, body: "Invalid signature" };
    }
  }

  try {
    const webhookEvent = JSON.parse(event.body);

    // ── PAYMENT SUCCEEDED ────────────────────────────────────────────────────
    if (webhookEvent.type === "payment_intent.succeeded") {
      const intent  = webhookEvent.data.object;
      const { product, email, skinType } = intent.metadata;
      const amount  = intent.amount / 100;
      const label   = PRODUCT_LABELS[product] || "SKINR Report";

      console.log(`Payment confirmed: ${intent.id} | ${product} | $${amount} | ${email || "no email"}`);

      // Send email with PDF if we have the customer's email
      if (email && process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
        try {
          console.log(`Generating report content for ${product}...`);
          const reportContent = await generateReportContent(product, skinType, intent.metadata);

          const pdfText  = buildPdfText(product, reportContent, skinType, email);
          const htmlBody = buildEmailHtml(product, skinType, label);
          const filename = `SKINR-${label.replace(/[^a-zA-Z0-9]/g, "-")}.txt`;
          const subject  = `Your SKINR ${label}`;

          // Send to customer
          await sendEmail(email, subject, htmlBody, pdfText, filename);
          console.log(`Report emailed to ${email}`);

          // Send notification to owner
          const ownerEmail = process.env.GMAIL_USER;
          await sendEmail(
            ownerEmail,
            `[SKINR Sale] ${label} -- $${amount} -- ${email}`,
            `<p>New purchase: ${label}<br>Amount: $${amount}<br>Customer: ${email}<br>Skin type: ${skinType || "not provided"}</p>`,
            `New purchase: ${label}\nAmount: $${amount}\nCustomer: ${email}\nSkin type: ${skinType || "not provided"}`,
            `SKINR-sale-${intent.id}.txt`
          );
          console.log("Owner notification sent");

        } catch (emailErr) {
          // Never let email failure break the webhook response
          // Stripe will retry if we return non-200
          console.error("Email delivery failed:", emailErr.message);
        }
      } else {
        console.log("No email provided -- skipping report delivery");
      }
    }

    // ── PAYMENT FAILED ───────────────────────────────────────────────────────
    if (webhookEvent.type === "payment_intent.payment_failed") {
      const intent = webhookEvent.data.object;
      console.error(`Payment failed: ${intent.id} -- ${intent.last_payment_error?.message}`);
    }

    // Always return 200 -- Stripe retries on non-200
    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error("Webhook handler error:", err.message);
    return { statusCode: 400, body: "Webhook error" };
  }
};
