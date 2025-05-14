// require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const eventRoutes = require('./routes/eventRoutes');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

// create app
const app = express();

// configure app
let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');

const mongoUri = 'mongodb+srv://test-user:testuser@cluster0.1lezd.mongodb.net/project3?retryWrites=true&w=majority&appName=Cluster0';

// start the server
mongoose.connect(mongoUri)
.then(
    app.listen(port, host, () => {
        console.log('Server is running on port', port);
    }))
.catch(err=>console.log(err.message));

// mount middleware
app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: mongoUri}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());

app.use((req, res, next) => {
    //to access user in the view templates. 
    res.locals.user = req.session.user || null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

// set up routes
app.use('/', mainRoutes);
app.use('/events', eventRoutes);
app.use('/users', userRoutes);


// error handling
app.use((req,res,next)=>{
    let err = new Error('The server cannot locate ' + req.url);
    err.status=404;
    next(err);
});

app.use((err,req, res, next)=>{
    if(!err.status){
        err.status = 500;
        err.message = ("Internal server error");

    }
    res.status(err.status);
    res.render('error', {err});
});

