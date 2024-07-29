export default async function handler(req, res) {
  const ALLOWED_ORIGINS = [
    "https://developer-tools.jwplayer.com",
    "https://plvip.online",
    "https://playervipmaster.com",
    "https://meuplayeronlinehd.com"
  ];

  try {
    const origin = req.headers.origin;
    if (!ALLOWED_ORIGINS.includes(origin)) {
      res.status(403).send("Origin not allowed");
      return;
    }

    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
      res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.status(200).send("");
      return;
    }

    const url = new URL(req.url, `https://${req.headers.host}`);
    const response = await fetch(url.href, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });

    const responseBody = await response.text();

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");

    res.status(response.status).send(responseBody);
  } catch (e) {
    res.status(500).send(e.stack || e.toString());
  }
}
