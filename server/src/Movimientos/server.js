

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const movimientos = require('./movimientos.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.send('ok'));
app.use('/api/movimientos', movimientos);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en :${PORT}`));
