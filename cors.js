// cors.js

function allowCrossDomain(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://playervipmaster.com'); // Substitua pelo domínio desejado
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
}

module.exports = allowCrossDomain;
