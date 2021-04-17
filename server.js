const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

//routes
const reportRoute = require('./routes/report-route.js');

//env vars config
require('dotenv').config();

// app and port set up
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// routes
app.use('/api/reports', reportRoute);

// start server
app.listen(port, () => {
    console.log(`Server is live on port ${port}`);
});