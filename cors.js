// cors.js

const cors = require('cors');

// Configuração do CORS para permitir múltiplas origens
const corsOptions = {
  origin: ['http://playervipmaster.com', 'http://meuplayeronlinehd.com', 'http://exemplo3.com']
};

module.exports = cors(corsOptions);
