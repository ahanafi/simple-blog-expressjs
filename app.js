const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const port = 3000;

mongoose.connect('mongodb://localhost/nodekb', {
    useMongoClient: true
});
let db = mongoose.connection;

//check connection
db.once('open', function(){
     console.log("Connectd to MongoDB");
});

//check of db errors
db.on('error', function(err){
    console.log(err);
});

//bring in Models
let Article = require('./models/articles');
//Init App
const app = express();

//Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//pBody parser middleware
app.use(bodyParser.urlencoded({extended: false}));
//parse application json
app.use(bodyParser.json());
//set public folder
app.use(express.static(path.join(__dirname, 'public')));
//Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));
//Express Messages Middleware
app.use(require('connect-flash'));
app.use(function(request, response, next){
    response.locals.messages = require('express-messages')(request, response);
    next();
});
//Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, values){
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg : msg,
            value: value
        };
    }
}));



//Home route
app.get('/', function(request, response){
    Article.find({}, function(err, articles){
        if(err){
            console.log(err);
        } else {
            response.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
    });
});

//Add Syubmit POST
app.post('/articles/add', function(request, response){
    let article = new Article();
    article.title = request.body.title;
    article.author = request.body.author;
    article.body = request.body.body;

    article.save(function(err){
        if(err){
            console.log(err);
        } else {
            request.flash('success', 'Article was successfully added!')
            response.redirect('/');
        }
    });
    
});

//Add article route
app.get('/articles/add', function(request, response){
    response.render('add', {
        title: 'Add Article'
    });
});

//Get single article
app.get('/article/:id', function(request, response){
    Article.findById(request.params.id, function(err, article){
        response.render('single', {
            title: 'Single Article',
            article: article
        });
    });
});

//Edit article
app.get('/article/edit/:id', function(request, response){
    Article.findById(request.params.id, function(err, article){
        response.render('edit', {
            title: 'Update Article',
            article: article
        });
    });
});

app.post('/article/edit/:id', function(request, response){
    let article = {};
    article.title = request.body.title;
    article.author = request.body.author;
    article.body = request.body.body;

    let query = {_id : request.params.id};

    Article.update(query, article, function(err){
        if(err){
            console.log(err);
        } else {
            response.redirect('/');
        }
    });
});

app.delete('/article/:id', function(request, response){
    let query = {_id: request.params.id};

    Article.remove(query, function(err){
        if(err){
            console.log(err);
        }

        response.send('success');
    });
});

//Start server
app.listen(port, function(){
    console.log("Server started at port "+port);
});