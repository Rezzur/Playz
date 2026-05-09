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
    const items = Array.isArray(body.items) ? body.items : [];
    const id = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    console.log("Playz order", {
      id,
      items,
      paymentCheck: "manual_review",
      source: body.source || "site",
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({
      ok: true,
      id,
      paymentCheck: "manual_review",
      message: "Заказ принят. Оплата будет проверена перед выдачей ключа.",
    });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
};
