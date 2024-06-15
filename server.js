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

    // Configuração do servidor CORS Anywhere
    const cors_proxy = require('./lib/cors-anywhere');
    const server = cors_proxy.createServer({
        originBlacklist: [],
        originWhitelist: [],
        requireHeader: ['origin', 'x-requested-with'],
        checkRateLimit: true,
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
        ],
        redirectSameOrigin: true,
        httpProxyOptions: {
            xfwd: false,
        },
    });

    // Middleware para configurar o cabeçalho Access-Control-Allow-Origin
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', 'https://playervipmaster.com'); // Substitua pela URL do seu frontend
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    });

    // Porta que o servidor Express vai escutar
    const port = process.env.PORT || 8080;

    // Inicia o servidor Express e o servidor CORS Anywhere
    app.listen(port, () => {
        console.log(`Servidor Node.js está rodando na porta ${port}`);
    });

    server.listen(port, () => {
        console.log('Running CORS Anywhere on port ' + port);
    });

})();
