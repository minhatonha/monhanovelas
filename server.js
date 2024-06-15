const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

(function() {
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = 'https://playervipmaster.com'; // Substitua "https://example.com" pelo seu domínio, se necessário
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        var args = slice.call(arguments);
        var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        return open.apply(this, args);
    };
    
    // Listen on a specific host via the HOST environment variable
    var host = process.env.HOST || '0.0.0.0';
    // Listen on a specific port via the PORT environment variable
    var port = process.env.PORT || 8080;

    // Middleware para definir os cabeçalhos CORS e verificar origem
    const allowedOrigins = ['https://playervipmaster.com', 'https://anotherallowed.com']; // Adicione os domínios permitidos aqui

    function setCORSHeaders(req, res, next) {
        const origin = req.headers.origin;
        if (allowedOrigins.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        } else {
            res.status(403).json({ message: 'Acesso Negado!' });
        }
    }

    // Adicionando o middleware de CORS ao seu servidor
    const express = require('express');
    const app = express();
    app.use(setCORSHeaders);

    // Suas outras configurações e rotas aqui
    app.get('/', (req, res) => {
        res.send('Hello, World!');
    });
    
    // Grab the blacklist from the command-line so that we can update the blacklist without deploying
    // again. CORS Anywhere is open by design, and this blacklist is not used, except for countering
    // immediate abuse (e.g. denial of service). If you want to block all origins except for some,
    // use originWhitelist instead.
    var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
    var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
    function parseEnvList(env) {
      if (!env) {
        return [];
      }
      return env.split(',');
    }

    // Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
    var checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

    var cors_proxy = require('./lib/cors-anywhere');
    cors_proxy.createServer({
      originBlacklist: originBlacklist,
      originWhitelist: originWhitelist,
      requireHeader: ['origin', 'x-requested-with'],
      checkRateLimit: checkRateLimit,
      removeHeaders: [
        'cookie',
        'cookie2',
        'origin',
        'referer',
        // Strip Heroku-specific headers
        'x-request-start',
        'x-request-id',
        'via',
        'connect-time',
        'total-route-time',
        // Other Heroku added debug headers
        // 'x-forwarded-for',
        // 'x-forwarded-proto',
        // 'x-forwarded-port',
      ],
      redirectSameOrigin: true,
      httpProxyOptions: {
        // Do not add X-Forwarded-For, etc. headers, because Heroku already adds it.
        xfwd: false,
      },
    }).listen(port, host, function() {
      console.log('Running CORS Anywhere on ' + host + ':' + port);
    });
})();
