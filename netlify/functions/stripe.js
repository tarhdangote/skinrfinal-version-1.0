/**
 * SKINR — Stripe Payment Intent Creator
 * netlify/functions/stripe.js
 *
 * Creates a PaymentIntent for one of the three report products.
 * The frontend uses the returned clientSecret to confirm payment
 * via Stripe.js — card data never touches this server.
 *
 * PCI compliance: SAQ A (self-assessment only).
 * The raw card number is handled entirely by Stripe's iframe.
 */

const PRICE_IDS = {
  biology: "price_1TRbMlCi5YWsRAVAIq1CPgvG",
  routine: "price_1TRbOsCi5YWsRAVAH72I6TS1",
  combo:   "price_1TRbQgCi5YWsRAVAFDHlX0LM",
};

const AMOUNTS = {
  biology: 1000, // $10.00 in cents
  routine: 1000,
  combo:   1500, // $15.00
};

const HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: HEADERS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: HEADERS, body: "Method Not Allowed" };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY not set in environment variables");
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: "Payment system not configured" }),
    };
  }

  try {
    const { product, email, skinType } = JSON.parse(event.body);

    if (!PRICE_IDS[product]) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: "Invalid product" }),
      };
    }

    const amount = AMOUNTS[product];

    // Create PaymentIntent via Stripe REST API
    // We use the REST API directly — no npm package needed in Netlify Functions
    const params = new URLSearchParams({
      amount,
      currency: "usd",
      "payment_method_types[]": "card",
      "metadata[product]":   product,
      "metadata[priceId]":   PRICE_IDS[product],
      "metadata[email]":     email || "",
      "metadata[skinType]":  skinType || "",
      description: `SKINR ${product === "biology" ? "Biology Report" : product === "routine" ? "Routine Card" : "Biology Report + Routine Card"}`,
    });

    if (email) params.append("receipt_email", email);

    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type":  "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const intent = await response.json();

    if (!response.ok) {
      console.error("Stripe API error:", JSON.stringify(intent));
      return {
        statusCode: response.status,
        headers: HEADERS,
        body: JSON.stringify({ error: intent.error?.message || "Payment setup failed" }),
      };
    }

    console.log(`PaymentIntent created: ${intent.id} for ${product} ($${amount / 100})`);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        clientSecret: intent.client_secret,
        intentId:     intent.id,
        amount,
        product,
      }),
    };

  } catch (err) {
    console.error("Stripe function error:", err.message);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: "Payment system error" }),
    };
  }
};
