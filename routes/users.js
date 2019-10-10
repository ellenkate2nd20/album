var express = require('express');
var router = express.Router();

// var firebase = require("firebase-admin");
// var serviceAccount = require("./../serviceAccountKey.json");

// firebase.initializeApp({
// 	credential: firebase.credential.cert(serviceAccount),
// 	databaseURL: "https://album-da872.firebaseio.com"
// }, 'users');

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

firebase.initializeApp(config, 'users');

var fbRef = firebase.database().ref();

// register form
router.get('/register', function(req, res, next)
{
	res.render('users/register');
});

// register
router.post('/register', function(req, res, next)
{
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
	var location = req.body.location;
	var fav_genres = req.body.fav_genres;
	var fav_artists = req.body.fav_artists;

	// validation
	req.checkBody('first_name', 'First name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(password);

	var errors = req.validationErrors();

	if(errors)
	{
		res.render('users/register', {errors: errors});
	}
	else
	{
		firebase.auth().createUserWithEmailAndPassword(email,password)

		.then(function(userData)
		{
			firebase.auth().signOut();
			
			console.log('Successfully created user with uid: ', userData.user.uid);

			var user = 
			{
				uid: userData.user.uid,
				first_name: first_name,
				last_name: last_name,
				email: email,
				location: location,
				fav_genres: fav_genres,
				fav_artists: fav_artists
			};

			var userRef = fbRef.child('users');

			// push album
			userRef.push().set(user);

			req.flash('success_msg', 'You are registered and can login');
			res.redirect('/users/login');
		})

		.catch(function(error)
		{
			console.log('Error creating user: ', error);
		});
	}
});

// login form
router.get('/login', function(req, res, next)
{
	res.render('users/login');
});

// login
router.post('/login', function(req, res, next)
{
	var email = req.body.email;
	var password = req.body.password;

	// validation
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();

	var errors = req.validationErrors();

	if(errors)
	{
		res.render('users/login', {errors: errors});
	}
	else
	{
		firebase.auth().signInWithEmailAndPassword(email, password)

		.then(function(authData)
		{
			console.log('Authenticated user with uid: ', authData.user.uid);

			req.flash('success_msg', 'You are now logged in');
			res.redirect('/albums');
		})

		.catch(function(error)
		{
			console.log('Login failed: ', error);

			req.flash('error_msg', 'Login failed');
			res.redirect('/users/login');
		});
	}
});

// logout
router.get('/logout', function(req, res, next)
{
	firebase.auth().signOut()

	.then(function()
	{
		console.log('You are logged out');

		req.flash('success_msg', 'You are now logged out');
		res.redirect('/users/login');
	})
});

module.exports = router;