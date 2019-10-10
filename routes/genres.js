var express = require('express');
var router = express.Router();

// var firebase = require("firebase-admin");
// var serviceAccount = require("./../serviceAccountKey.json");

// firebase.initializeApp({
// 	credential: firebase.credential.cert(serviceAccount),
// 	databaseURL: "https://album-da872.firebaseio.com"
// }, 'genres');

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

firebase.initializeApp(config, 'genres');

var fbRef = firebase.database().ref();

// redirect to login form
router.get('*', function(req, res, next)
{
	if(firebase.auth().currentUser == null)
	{
		res.redirect('/users/login');
	}
	next();
});

// show genres
router.get('/', function(req, res, next)
{
	var genreRef = fbRef.child('genres');

	genreRef.once('value', function(snapshot)
	{
		var genres = [];

		// get data
		snapshot.forEach(function(childSnapshot)
		{
			if(childSnapshot.val().uid == firebase.auth().currentUser.uid)
			{
				genres.push(
				{
					id: childSnapshot.key,
					name: childSnapshot.val().name
				});
			}
		});

		res.render('genres/index', {genres: genres});
	});
});

// add genres form
router.get('/add', function(req, res, next)
{
	res.render('genres/add');
});

// add genres
router.post('/add', function(req, res, next)
{
	var genre = 
	{
		name: req.body.name,
		uid: firebase.auth().currentUser.uid
	};
	
	var genreRef = fbRef.child('genres');

	// push genre
	genreRef.push().set(genre);
	
	req.flash('success_msg', 'Genre Saved');
	res.redirect('/genres')
});

// update genre form
router.get('/edit/:id', function(req, res, next)
{
	var id = req.params.id;
	var genreRef = fbRef.child('genres/' + id);

	genreRef.once('value', function(snapshot)
	{
		var genre = snapshot.val();
		res.render('genres/edit', {genre: genre, id: id});
	});
});

// update genre 
router.post('/edit/:id', function(req, res, next)
{
	var id = req.params.id;
	var name = req.body.name;
	var genreRef = fbRef.child('genres/' + id);

	genreRef.update({name: name});
	req.flash('success_msg', 'Genre Updated');
	res.redirect('/genres');
});

// delete genre 
router.post('/delete/:id', function(req, res, next)
{
	var id = req.params.id;
	var genreRef = fbRef.child('genres/' + id);

	genreRef.remove();
	req.flash('success_msg', 'Genre Deleted');
	res.redirect('/genres');
});

module.exports = router;