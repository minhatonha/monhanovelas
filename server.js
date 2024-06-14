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

// Middleware to set the Referer and Origin headers
app.use((req, res, next) => {
  req.headers['referer'] = 'https://www.starplus.com/';
  req.headers['origin'] = 'https://www.starplus.com/';
  next();
});

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
