// /api/submitScore.js
export default async function handler(req, res) {
  const sheetUrl = process.env.SHEETS_WEBHOOK_URL;
  const secret = process.env.SHEETS_SECRET;

  if (!sheetUrl || !secret) {
    return res.status(500).json({ error: "server_not_configured" });
  }

  try {
    if (req.method === "GET") {
      // Forward leaderboard or get queries directly to Apps Script
      const query = new URLSearchParams(req.query).toString();
      const response = await fetch(`${sheetUrl}?${query}&secret=${secret}`);
      const text = await response.text();

      try {
        const json = JSON.parse(text);
        return res.status(200).json(json);
      } catch {
        return res.status(200).send(text);
      }
    }

    if (req.method === "POST") {
      const { roll, snakeScore, flappyScore, stackScore } = req.body || {};

      // Roll validation
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

      try {
        const json = JSON.parse(text);
        if (!response.ok) {
          return res.status(502).json({ error: "sheet_error", details: json });
        }
        return res.status(200).json({ success: true, sheet: json });
      } catch {
        if (!response.ok) return res.status(502).send(text);
        return res.status(200).send(text);
      }
    }

    return res.status(405).json({ error: "method_not_allowed" });
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "server_error" });
  }
}
