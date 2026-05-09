const readBody = (req) => {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);

  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
};

const verifyRecaptcha = async (token) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { ok: true, mode: "not_configured" };
  if (!token) return { ok: false, mode: "missing_token" };

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  const result = await response.json();
  return { ok: !!result.success, mode: "verified", score: result.score ?? null };
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const body = await readBody(req);
    const fields = body.fields || {};

    if (fields.website) {
      res.status(204).end();
      return;
    }

    const recaptcha = await verifyRecaptcha(body.recaptchaToken);
    if (!recaptcha.ok) {
      res.status(403).json({ ok: false, error: "reCAPTCHA failed", recaptcha });
      return;
    }

    const id = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    console.log("Playz lead", {
      id,
      action: body.action,
      fields,
      recaptcha,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({
      ok: true,
      id,
      moderation: String(body.action || "").includes("review"),
      recaptcha,
    });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
};
