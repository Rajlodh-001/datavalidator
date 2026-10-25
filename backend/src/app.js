const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/', routes);

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
