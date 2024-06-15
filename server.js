require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Obter a lista de permissões do arquivo .env
const whitelist = process.env.CORS_WHITELIST.split(',');

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

// Usar o middleware CORS
app.use(cors(corsOptions));

// Exemplo de rota
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Inicializar o servidor
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
