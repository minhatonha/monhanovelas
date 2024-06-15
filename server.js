require('dotenv').config();
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

(function() {
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = 'https://playervipmaster.com'; // Substitua pelo seu domínio
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        var args = slice.call(arguments);
        var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        open.apply(this, args);

        // Adiciona os cabeçalhos obrigatórios após a chamada ao método open
        this.setRequestHeader('origin', origin);
        this.setRequestHeader('x-requested-with', 'XMLHttpRequest');
    };

    // Configuração do servidor CORS Anywhere
    var host = process.env.HOST || '0.0.0.0';
    var port = process.env.PORT || 8080;
    var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
    var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
    var refererWhitelist = parseEnvList(process.env.CORSANYWHERE_REFERERWHITELIST); // Lista de permissões de referer

    function parseEnvList(env) {
        if (!env) {
            return [];
        }
        return env.split(',');
    }

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
            'x-request-start',
            'x-request-id',
            'via',
            'connect-time',
            'total-route-time',
        ],
        redirectSameOrigin: true,
        httpProxyOptions: {
            xfwd: false,
        },
        handleInitialRequest: function(req, res, location) {
            var originHeader = req.headers.origin;
            var refererHeader = req.headers.referer;

            // Verificar se o origin está na whitelist
            if (originHeader && !originWhitelist.includes(originHeader)) {
                res.writeHead(403, 'Origin not allowed');
                res.end('Origin not allowed');
                return true; // Bloquear a solicitação
            }

            // Verificar se o referer está na whitelist
            if (refererHeader && !refererWhitelist.some(whitelisted => refererHeader.startsWith(whitelisted))) {
                res.writeHead(403, 'Referer not allowed');
                res.end('Referer not allowed');
                return true; // Bloquear a solicitação
            }

            // Permitir a solicitação
            return false;
        }
    }).listen(port, host, function() {
        console.log('Running CORS Anywhere on ' + host + ':' + port);
    });
})();
