const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Morgan middleware for logging
// app.use(morgan('combined'));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Import the new route files
const generateNtvRoute = require('./routes/generate_ntv');
const generateTyfrRoute = require('./routes/generate_tyfr');
const generateTyfrMtmRoute = require('./routes/generate_mtm');

// Other app configuration and middleware

// Use the new routes
app.use(generateNtvRoute);
app.use(generateTyfrRoute);
app.use(generateTyfrMtmRoute);

app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running. http://localhost:3000');
});