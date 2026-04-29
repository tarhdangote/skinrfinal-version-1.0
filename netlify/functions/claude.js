/**
 * SKINR — Claude API Proxy
 * netlify/functions/claude.js
 */

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod === "GET") {
    const keyPresent = !!process.env.ANTHROPIC_API_KEY;
    const keyStart = process.env.ANTHROPIC_API_KEY
      ? process.env.ANTHROPIC_API_KEY.substring(0, 14) + "..."
      : "NOT SET";
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: "SKINR function live",
        model: "claude-haiku-4-5-20251001",
        apiKeyPresent: keyPresent,
        apiKeyPreview: keyStart,
      }),
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body);
    // Caller controls max_tokens — capped at 4000 for safety.
    // Default 1500 if not specified. Shave stage 1 sends 800, stage 2 sends 1200.
    const maxTokens = Math.min(parseInt(body.maxTokens) || 1500, 4000);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: maxTokens,
        system: body.system || "",
        messages: body.messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", JSON.stringify(data));
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data }),
      };
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (err) {
    console.error("Function error:", err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
