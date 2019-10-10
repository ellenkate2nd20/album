var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-Parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var flash = require('connect-flash');

// var firebase = require("firebase-admin");
// var serviceAccount = require("./serviceAccountKey.json");

// firebase.initializeApp({
// 	credential: firebase.credential.cert(serviceAccount),
// 	databaseURL: "https://album-da872.firebaseio.com"
// });

var firebase = require("firebase");
var config = 
{
	apiKey: "AIzaSyCNUDi6xQP1CW0d_LoMRVK7DdsnOQ37hII",
	authDomain: "album-da872.firebaseapp.com",
	databaseURL: "https://album-da872.firebaseio.com",
	projectId: "album-da872",
	storageBucket: "album-da872.appspot.com",
	messagingSenderId: "952028378238"
};

firebase.initializeApp(config);

var fbRef = firebase.database().ref();

// route files
var routes = require('./routes/index');
var albums = require('./routes/albums');
var genres = require('./routes/genres');
var users = require('./routes/users');

// init app
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ----------------------MIDDLEWARE-------------------------

// logger
app.use(logger('dev'));

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// cookie parser
app.use(cookieParser());

// handle sessions
app.use(session(
{
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

// validator
app.use(expressValidator(
{
	errorFormatter: function(param, msg, value)
	{
		var namespace = param.split('.');
		var formParam = namespace.shift();

		while(namespace.length)
		{
			formParam += '[' + namespace.shift() + ']';
		}

		return {
			param: formParam,
			msg: msg,
			value: value
		};
	}
}));

// static folder
app.use(express.static(path.join(__dirname, 'public')));

// connect-flash
app.use(flash());

// global variables
app.use(function(req, res, next)
{
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.page = req.url;
	res.locals.authdata = firebase.auth().currentUser;

	var currentUser = firebase.auth().currentUser;
	if(currentUser)
	{
		var userRef = fbRef.child('users');
		userRef.orderByChild('uid').equalTo(currentUser.uid)
			.on('value', function(snapshot)
		{
			snapshot.forEach(function(childSnapshot)
			{
				res.locals.user = childSnapshot.val();
				console.log(res.locals.user);
			});
		});
	}
	else
	{
		console.log(null);
	}

	next();
})

// ---------------------------------------------------------

// routes
app.use('/', routes);
app.use('/albums', albums);
app.use('/genres', genres);
app.use('/users', users);

// set port
app.set('port', (process.env.PORT || 3000));

// run server
app.listen(app.get('port'), function()
{
	console.log('Server started on port: ' + app.get('port'));
});