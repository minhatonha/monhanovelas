export default async function handler(req, res) {
  const ALLOWED_ORIGINS = [
    "https://developer-tools.jwplayer.com",
    "https://plvip.online",
    "https://playervipmaster.com",
    "https://meuplayeronlinehd.com"
  ];

  try {
    const origin = req.headers.origin;

    // Verifica se a origem é permitida
    if (!ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.status(403).send("Origin not allowed");
      return;
    }

    // Trata requisições OPTIONS (preflight)
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
      res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.status(200).send("");
      return;
    }

    // Extrai a URL da requisição
    const { pathname } = new URL(req.url, `https://${req.headers.host}`);
    const targetUrl = decodeURIComponent(pathname.slice('/api/proxy2/'.length));

    // Verifica se a URL é válida
    if (!targetUrl || !/^https?:\/\//.test(targetUrl)) {
      res.status(400).send("Invalid URL");
      return;
    }

    // Faz a requisição para a URL alvo
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(targetUrl).host  // Define o host correto para a requisição
      },
      body: req.method === "POST" || req.method === "PUT" ? req.body : undefined,
    });

    // Ajusta a resposta
    const responseBody = await response.text();

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");

    res.status(response.status).send(responseBody);
  } catch (e) {
    res.status(500).send(e.stack || e.toString());
  }
}
