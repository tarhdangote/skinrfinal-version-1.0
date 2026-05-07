// ─────────────────────────────────────────────────────────────────────────────
// SKINR Subscribe Function
// Receives email + skin/shave context from the post-analysis modal.
// 1. Sends a branded welcome email via Gmail SMTP
// 2. Adds contact to Loops.so with skinType tag
// ─────────────────────────────────────────────────────────────────────────────
const nodemailer = require("nodemailer");

const LOOPS_API = "https://app.loops.so/api/v1";

// ── WELCOME EMAIL HTML ────────────────────────────────────────────────────────
const buildWelcomeEmail = (skinType, lang) => {
  const C = {
    bg:"#050505", header:"#080808", gold:"#B8972A",
    white:"#F2EEE6", soft:"#B8AEA6", border:"#1E1A14"
  };

  const copy = {
    en: {
      subject: "Your SKINR protocol is ready",
      headline: "Welcome to SKINR.",
      sub: `Your ${skinType||"personalised"} skin protocol is live.`,
      body: "Every recommendation in your protocol is based on your exact skin biology — not generic advice. Follow it consistently for 12 weeks. That is the clinical measurement window where results become visible.",
      tip: "Your one non-negotiable this week: SPF every morning. UV exposure is responsible for approximately 80% of visible skin ageing. Nothing else in your protocol works as well without this foundation.",
      cta: "Open My Protocol",
      footer: "SKINR — tryskinr.com — hello@tryskinr.com",
    },
    fr: {
      subject: "Ton protocole SKINR est prêt",
      headline: "Bienvenue chez SKINR.",
      sub: `Ton protocole de soin ${skinType||"personnalisé"} est actif.`,
      body: "Chaque recommandation de ton protocole est basée sur ta biologie cutanée exacte — pas des conseils génériques. Suis-le de façon constante pendant 12 semaines. C'est la fenêtre de mesure clinique où les résultats deviennent visibles.",
      tip: "Ton incontournable cette semaine : FPS chaque matin. L'exposition aux UV est responsable d'environ 80% du vieillissement cutané visible.",
      cta: "Ouvrir Mon Protocole",
      footer: "SKINR — tryskinr.com — hello@tryskinr.com",
    },
    es: {
      subject: "Tu protocolo SKINR está listo",
      headline: "Bienvenido a SKINR.",
      sub: `Tu protocolo de cuidado ${skinType||"personalizado"} está activo.`,
      body: "Cada recomendación de tu protocolo está basada en tu biología cutánea exacta — no consejos genéricos. Síguelo consistentemente durante 12 semanas. Esa es la ventana de medición clínica donde los resultados se vuelven visibles.",
      tip: "Tu elemento no negociable esta semana: FPS cada mañana. La exposición UV es responsable de aproximadamente el 80% del envejecimiento cutáneo visible.",
      cta: "Abrir Mi Protocolo",
      footer: "SKINR — tryskinr.com — hello@tryskinr.com",
    },
  };

  const t = copy[lang] || copy.en;

  return {
    subject: t.subject,
    html: `<!DOCTYPE html>
<html lang="${lang||"en"}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};">
<tr><td align="center" style="padding:32px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- Gold top bar -->
  <tr><td style="background:${C.gold};height:3px;"></td></tr>

  <!-- Header -->
  <tr><td style="background:${C.header};padding:24px 32px;border-bottom:1px solid ${C.border};">
    <div style="text-align:center;">
      <span style="font-size:20px;font-weight:700;color:${C.white};letter-spacing:5px;">◆ SKINR</span><br>
      <span style="font-size:8px;letter-spacing:2px;color:${C.soft};text-transform:uppercase;">Free. Clinical. Built for Men.</span>
    </div>
  </td></tr>

  <!-- Headline -->
  <tr><td style="padding:28px 32px 8px;background:${C.bg};">
    <div style="font-size:9px;letter-spacing:4px;color:${C.gold};text-transform:uppercase;margin-bottom:10px;">Welcome</div>
    <div style="font-size:22px;font-weight:700;color:${C.white};margin-bottom:6px;">${t.headline}</div>
    <div style="font-size:14px;color:${C.soft};margin-bottom:20px;">${t.sub}</div>
    <div style="border-top:1px solid ${C.border};"></div>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:20px 32px;background:${C.bg};">
    <div style="font-size:14px;color:${C.soft};line-height:1.85;">${t.body}</div>
  </td></tr>

  <!-- Tip -->
  <tr><td style="padding:0 32px 20px;background:${C.bg};">
    <div style="background:#0D0D0D;border-left:3px solid ${C.gold};padding:14px 18px;">
      <div style="font-size:9px;letter-spacing:3px;color:${C.gold};text-transform:uppercase;margin-bottom:6px;">Week 1 — Non-Negotiable</div>
      <div style="font-size:13px;color:${C.white};line-height:1.75;font-style:italic;">${t.tip}</div>
    </div>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 32px 28px;background:${C.bg};text-align:center;">
    <a href="https://tryskinr.com" style="display:inline-block;background:${C.gold};color:${C.bg};text-decoration:none;font-size:9px;letter-spacing:3px;font-weight:700;text-transform:uppercase;padding:14px 36px;">${t.cta}</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:14px 32px;background:#0D0D0D;border-top:1px solid ${C.border};">
    <div style="text-align:center;font-size:10px;color:#4E4844;">${t.footer}</div>
    <div style="text-align:center;font-size:9px;color:#3A3634;margin-top:4px;">
      You received this because you signed up at tryskinr.com.
    </div>
  </td></tr>

  <!-- Gold bottom bar -->
  <tr><td style="background:${C.gold};height:2px;"></td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
  };
};

// ── ADD TO LOOPS ──────────────────────────────────────────────────────────────
const addToLoops = async (email, skinType, lang) => {
  if(!process.env.LOOPS_API_KEY) return;
  await fetch(`${LOOPS_API}/contacts/create`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.LOOPS_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      skinType: skinType || "unknown",
      source: "skinr-email-modal",
      userGroup: "subscriber",
      mailingLists: {},
    }),
  });
};

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const { email, skinType, lang } = JSON.parse(event.body || "{}");
    if (!email || !email.includes("@")) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid email" }) };
    }

    // 1 — Send welcome email
    const { subject, html } = buildWelcomeEmail(skinType, lang || "en");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASS },
    });
    await transporter.sendMail({
      from:    `SKINR <${process.env.GMAIL_USER}>`,
      replyTo: `SKINR <hello@tryskinr.com>`,
      to:      email,
      subject,
      html,
    });

    // 2 — Add to Loops (non-blocking)
    addToLoops(email, skinType, lang).catch(() => {});

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };

  } catch (err) {
    console.error("Subscribe error:", err.message);
    // Always return 200 so the user sees success even if email fails
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }
};
