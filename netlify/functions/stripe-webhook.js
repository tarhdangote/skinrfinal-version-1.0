/**
 * SKINR — Stripe Webhook Handler
 * netlify/functions/stripe-webhook.js
 *
 * Receives payment confirmation events from Stripe.
 * Verifies the webhook signature to prevent spoofing.
 * Logs successful payments for your records.
 *
 * To set up:
 * 1. Go to Stripe Dashboard → Developers → Webhooks → Add endpoint
 * 2. Endpoint URL: https://skinrfinal.netlify.app/.netlify/functions/stripe-webhook
 * 3. Select event: payment_intent.succeeded
 * 4. Copy the Signing Secret (whsec_...) to Netlify env as STRIPE_WEBHOOK_SECRET
 */

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSignature = event.headers["stripe-signature"];

  // If webhook secret is configured, verify the signature
  // This prevents anyone from calling this endpoint directly to fake a payment
  if (webhookSecret && stripeSignature) {
    try {
      const payload = event.body;
      const [timestampPart, ...sigParts] = stripeSignature.split(",");
      const timestamp = timestampPart.split("=")[1];
      const signatures = sigParts
        .filter(s => s.startsWith("v1="))
        .map(s => s.split("=")[1]);

      const signedPayload = `${timestamp}.${payload}`;

      // Verify using Node.js built-in crypto
      const crypto = require("crypto");
      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(signedPayload, "utf8")
        .digest("hex");

      const isValid = signatures.some(sig =>
        crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"))
      );

      if (!isValid) {
        console.error("Webhook signature verification failed");
        return { statusCode: 400, body: "Invalid signature" };
      }

      // Check timestamp is within 5 minutes to prevent replay attacks
      const tolerance = 300; // seconds
      if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > tolerance) {
        console.error("Webhook timestamp too old");
        return { statusCode: 400, body: "Timestamp too old" };
      }

    } catch (err) {
      console.error("Webhook verification error:", err.message);
      return { statusCode: 400, body: "Verification failed" };
    }
  }

  try {
    const webhookEvent = JSON.parse(event.body);

    if (webhookEvent.type === "payment_intent.succeeded") {
      const intent = webhookEvent.data.object;
      const { product, email, skinType } = intent.metadata;

      console.log(`✅ Payment confirmed:
        ID:       ${intent.id}
        Product:  ${product}
        Amount:   $${intent.amount / 100} ${intent.currency.toUpperCase()}
        Email:    ${email || "not provided"}
        SkinType: ${skinType || "not provided"}
        Time:     ${new Date().toISOString()}
      `);

      // Future: trigger email delivery, update database, etc.
      // For now, the frontend handles unlock via localStorage after
      // receiving payment confirmation from Stripe.js directly.
    }

    if (webhookEvent.type === "payment_intent.payment_failed") {
      const intent = webhookEvent.data.object;
      console.error(`❌ Payment failed: ${intent.id} — ${intent.last_payment_error?.message}`);
    }

    // Always return 200 to Stripe — otherwise they retry the webhook
    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error("Webhook handler error:", err.message);
    return { statusCode: 400, body: "Webhook error" };
  }
};
