var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './public/images'});

// var firebase = require("firebase-admin");
// var serviceAccount = require("./../serviceAccountKey.json");

// firebase.initializeApp({
// 	credential: firebase.credential.cert(serviceAccount),
// 	databaseURL: "https://album-da872.firebaseio.com"
// }, 'albums');

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

firebase.initializeApp(config, 'albums');

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

// show albums
router.get('/', function(req, res, next)
{
	var albumRef = fbRef.child('albums');

	albumRef.once('value', function(snapshot)
	{
		var albums = [];

		// get data
		snapshot.forEach(function(childSnapshot)
		{
			if(childSnapshot.val().uid == firebase.auth().currentUser.uid)
			{
				albums.push(
				{
					id: childSnapshot.key,
					artist: childSnapshot.val().artist,
					title: childSnapshot.val().title,
					genre: childSnapshot.val().genre,
					info: childSnapshot.val().info,
					year: childSnapshot.val().year,
					label: childSnapshot.val().label,
					tracks: childSnapshot.val().tracks,
					cover: childSnapshot.val().cover
				});
			}
		});

		res.render('albums/index', {albums: albums});
	});
});

// add albums form
router.get('/add', function(req, res, next)
{
	var genreRef = fbRef.child('genres');

	genreRef.once('value', function(snapshot)
	{
		var genres = [];

		// get genres data
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

		res.render('albums/add', {genres: genres});
	});
});

// add albums
router.post('/add', upload.single('cover'), function(req, res, next)
{
	// check file upload
	if(req.file)
	{
		console.log('uploading file...');
		var cover = req.file.filename;
	}
	else
	{
		console.log('no file uploaded...');
		var cover = 'noimage.jpg';
	}

	// build album onject
	var album = 
	{
		artist: req.body.artist,
		title: req.body.title,
		genre: req.body.genre,
		info: req.body.info,
		year: req.body.year,
		label: req.body.label,
		tracks: req.body.tracks,
		cover: cover,
		uid: firebase.auth().currentUser.uid
	};

	var albumRef = fbRef.child('albums');

	// push album
	albumRef.push().set(album);
	
	req.flash('success_msg', 'Album Saved');
	res.redirect('/albums')

});

// album detail
router.get('/details/:id', function(req, res, next)
{
	var id = req.params.id;
	var albumRef = fbRef.child('albums/' + id);

	albumRef.once('value', function(snapshot)
	{
		var album = snapshot.val();
		res.render('albums/details', {album: album, id: id});
	});
});

// update album form
router.get('/edit/:id', function(req, res, next)
{
	var id = req.params.id;
	var albumRef = fbRef.child('albums/' + id);
	var genreRef = fbRef.child('genres');

	genreRef.once('value', function(snapshot)
	{
		var genres = [];

		// get genres data
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
		
		// get album data
		albumRef.once('value', function(snapshot)
		{
			var album = snapshot.val();
			res.render('albums/edit', { album: album, genres: genres, id: id });
		});
	});
});

// update album 
router.post('/edit/:id', upload.single('cover'), function(req, res, next)
{
	var id = req.params.id;
	var albumRef = fbRef.child('albums/' + id);

	// check file upload
	if(req.file)
	{
		var cover = req.file.filename;
		albumRef.update(
		{
			artist: req.body.artist,
			title: req.body.title,
			genre: req.body.genre,
			info: req.body.info,
			year: req.body.year,
			label: req.body.label,
			tracks: req.body.tracks,
			cover: cover
		});
	}
	else
	{
		albumRef.update(
		{
			artist: req.body.artist,
			title: req.body.title,
			genre: req.body.genre,
			info: req.body.info,
			year: req.body.year,
			label: req.body.label,
			tracks: req.body.tracks,
		});
	}

	req.flash('success_msg', 'Album Updated');
	res.redirect('/albums/details/' + id);
});

// delete album 
router.post('/details/delete/:id', function(req, res, next)
{
	var id = req.params.id;
	var albumRef = fbRef.child('albums/' + id);

	albumRef.remove();
	req.flash('success_msg', 'Album Deleted');
	res.redirect('/albums');
});

module.exports = router;