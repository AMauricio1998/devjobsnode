const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const handlebars = require('express-handlebars').create({ defaultLayout: 'layout', helpers: require('./helpers/handlebars') });
const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('./config/passport')

require('dotenv').config({ path: '.env' })

const app = express();

//Habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Vlidacion de campos
app.use(expressValidator());

//Habilitar handlebars
app.engine('handlebars', handlebars.engine);

app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE })
}))

//inicializar passport 
app.use(passport.initialize());
app.use(passport.session());

//Alertas y flash messages
app.use(flash());

//crear nuestro middleware
app.use((req, res, next) => { 
    res.locals.mensajes = req.flash();
    next();
})

app.use('/', router());

app.listen(process.env.PORT);