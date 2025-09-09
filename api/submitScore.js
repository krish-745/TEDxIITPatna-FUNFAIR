// /api/submitScore.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // parse body (Vercel gives parsed body when Content-Type: application/json)
  const { roll, snakeScore, flappyScore, stackScore } = req.body || {};

  const rollRegex = /^2[0-9]{3}[A-Za-z]{2}[0-9]{2}$/;
  if (!roll || !rollRegex.test(roll)) {
    return res.status(400).json({ error: "invalid_roll" });
  }

  const sScore = Number(snakeScore) || 0;
  const fScore = Number(flappyScore) || 0;
  const stScore = Number(stackScore) || 0;
  if (sScore < 0 || fScore < 0 || stScore < 0) {
    return res.status(400).json({ error: "invalid_score" });
  }

  const sheetUrl = process.env.SHEETS_WEBHOOK_URL;
  const secret = process.env.SHEETS_SECRET;
  if (!sheetUrl || !secret) {
    return res.status(500).json({ error: "server_not_configured" });
  }

  try {
    // Forward as form-data (Apps Script expects URL-encoded params)
    const params = new URLSearchParams({
      action: "upsert",
      roll,
      snakeScore: String(sScore),
      flappyScore: String(fScore),
      stackScore: String(stScore),
      secret: secret
    });

    const response = await fetch(sheetUrl, { method: "POST", body: params });
    const text = await response.text();

    // Try to return the Apps Script JSON if possible
    try {
      const json = JSON.parse(text);
      if (!response.ok) return res.status(502).json({ error: "sheet_error", details: json });
      return res.status(200).json({ success: true, sheet: json });
    } catch (err) {
      // non-JSON response
      if (!response.ok) return res.status(502).send(text);
      return res.status(200).send(text);
    }
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "server_error" });
  }
}
