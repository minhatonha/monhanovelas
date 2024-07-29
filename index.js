const express = require('express');
const corsConfig = require('./cors');

const app = express();
app.use(corsConfig);
