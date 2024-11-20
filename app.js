const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const fileUpload = require('express-fileupload'); // Declare once
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressFlash = require('express-flash'); // Use express-flash
const {dbconnect} = require("./server/config/db.js")
const path = require('path');


const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config();
dbconnect();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(expressLayouts);
app.use(cookieParser('RecipeSecure'));
app.use(session({
    secret: 'RecipeSecretSession',
    saveUninitialized: true,
    resave: true
}));

app.use(expressFlash());  // Initialize express-flash for flash messaging
app.use(fileUpload()); // Initialize the fileUpload middleware

app.set('layout', './layouts/main');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const routes = require('./server/routes/recipeRouter.js');
app.use('/', routes);

app.listen(port, () => 
    console.log(`Listening to the ${port}`)
);
