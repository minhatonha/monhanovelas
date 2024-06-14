const express = require('express');
const corsAnywhere = require('./lib/cors-anywhere');

// Listen on a specific host via the HOST environment variable
const host = process.env.HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
const port = process.env.PORT || 8080;

// Grab the blacklist from the command-line so that we can update the blacklist without deploying again.
// CORS Anywhere is open by design, and this blacklist is not used, except for countering immediate abuse
// (e.g. denial of service). If you want to block all origins except for some, use originWhitelist instead.
const originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
const originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}

// Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
const checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

const app = express();

// Create the CORS Anywhere proxy server
app.use((req, res) => {
  corsAnywhere.createServer({
    originBlacklist: originBlacklist,
    originWhitelist: originWhitelist,
    requireHeader: ['origin', 'x-requested-with'],
    checkRateLimit: checkRateLimit,
    removeHeaders: [
      'cookie',
      'cookie2',
      // Strip Heroku-specific headers
      'x-request-start',
      'x-request-id',
      'via',
      'connect-time',
      'total-route-time',
      'referer',
      'origin',
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
  }).emit('request', req, res);
});

app.listen(port, host, () => {
  console.log(`Running CORS Anywhere on ${host}:${port}`);
});

function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}

// Client-side JavaScript to be injected into the served pages
const clientSideScript = `
(function() {
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = window.location.protocol + '//' + window.location.host;
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
})();
`;

// Serve the client-side script at a specific endpoint
app.get('/client-side-script.js', (req, res) => {
  res.type('application/javascript').send(clientSideScript);
});
