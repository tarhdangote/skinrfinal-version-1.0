/**
 * SKINR — Stripe Payment Intent Creator
 * netlify/functions/stripe.js
 */

const PRODUCTS = {
  "biology":          { priceId: "price_1TRbMlCi5YWsRAVAIq1CPgvG", amount: 1500, label: "SKINR Skin Biology Report" },
  "routine":          { priceId: "price_1TRbOsCi5YWsRAVAH72I6TS1", amount: 1200, label: "SKINR Personalised Routine Card" },
  "skin-combo":       { priceId: "price_1TRbQgCi5YWsRAVAFDHlX0LM", amount: 2200, label: "SKINR Skin Analysis Bundle" },
  "shave-biology":    { priceId: "price_1TRf10Ci5YWsRAVARhNuKC4u", amount: 1500, label: "SKINR Shave Biology Report" },
  "shave-card":       { priceId: "price_1TRf3hCi5YWsRAVA4oNz5i34", amount: 1200, label: "SKINR Shave Protocol Card" },
  "shave-combo":      { priceId: "price_1TRf5hCi5YWsRAVAmZpTERl9", amount: 2200, label: "SKINR Shave Protocol Bundle" },
  "skincare-guide":   { priceId: "price_1TRfOLCi5YWsRAVAezkOgVmT", amount:  900, label: "SKINR Men's Skincare Guide" },
  "shaving-guide":    { priceId: "price_1TRfPyCi5YWsRAVAwIFSPFyN", amount:  900, label: "SKINR Men's Shaving Guide" },
  "guides-combo":     { priceId: "price_1TRfRMCi5YWsRAVA3sIcGC6I", amount: 1500, label: "SKINR Both Guides Bundle" },
  "analysis-email":   { priceId: "price_1TUzeWCi5YWsRAVAwe8xvjh4", amount:  100, label: "SKINR Analysis Email Delivery" },
};

const HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: HEADERS, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: HEADERS, body: "Method Not Allowed" };

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: "Payment system not configured" }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { product, email, skinType, lang, analysisType, concern, budget } = body;
    const productInfo = PRODUCTS[product];
    if (!productInfo) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: `Unknown product: ${product}` }) };
    }

    const params = new URLSearchParams({
      amount: productInfo.amount,
      currency: "usd",
      "payment_method_types[]": "card",
      "metadata[product]": product,
      "metadata[priceId]": productInfo.priceId,
      "metadata[email]": email || "",
      "metadata[skinType]": skinType || "",
      "metadata[lang]": lang || "en",
      "metadata[analysisType]": analysisType || "skin",
      "metadata[concern]": (concern || "").substring(0, 490),
      "metadata[budget]": budget || "",
      description: productInfo.label,
    });

    // Pass analysis step data for the $1 email delivery product
    if (product === "analysis-email") {
      const stepKeys = ["m0","m1","m2","m3","m4","m5","e0","e1","e2","e3","e4",
                        "ps0","ps1","ps2","ps3","d0","d1","d2","d3","po0","po1","po2","po3","po4",
                        "avoid","proTip","headline","clinicalFinding","criticalRule","expectedImprovement"];
      stepKeys.forEach(k => {
        if (body[k]) params.append(`metadata[${k}]`, String(body[k]).substring(0, 499));
      });
    }

    if (email) params.append("receipt_email", email);

    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: { "Authorization": `Bearer ${secretKey}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const intent = await response.json();
    if (!response.ok) {
      console.error("Stripe error:", JSON.stringify(intent));
      return { statusCode: response.status, headers: HEADERS, body: JSON.stringify({ error: intent.error?.message || "Payment failed" }) };
    }

    console.log(`PaymentIntent: ${intent.id} — ${product} $${productInfo.amount/100}`);
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ clientSecret: intent.client_secret, intentId: intent.id, amount: productInfo.amount, product }) };

  } catch (err) {
    console.error("Stripe error:", err.message);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: "Payment system error" }) };
  }
};
