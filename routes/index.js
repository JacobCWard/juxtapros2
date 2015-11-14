var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var passport = require('passport');

var databaseName = 'test';
var databaseURL = 'mongodb://127.0.0.1:27017/' + databaseName;
var databaseCollection = 'restaurants';

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("Current user: " + JSON.stringify(req.user));
    if (req.user){
        var currentUsername = req.user.displayName
    }
    else {
        var currentUsername = "<a href=\"/login\">Log In</a>"
    }
    res.render('index', { title: 'JuxtaPros 2', currentUser: currentUsername });
});

router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Login' })
});

router.post('/login',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: false
    })
);

router.param('docid', function (req, res, next, docID) {
  req.docID = docID;
  next();
});

router.route('/doc/:docid')
.all(function (req, res, next) {
  withDB(function (db) {
    req.db = db;

    db.collection(databaseCollection)
    .find({ restaurant_id: req.docID })
    .toArray(function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        req.docFound = true;
        req.docObj = result[0];
      } else {
        req.docFound = false;
      }
      next();
    })
  });
})
.get(function (req, res, next) {
    if (req.docFound)
        res.json(req.docObj);
    else
        res.json({});
    next();
})
.post(function (req, res, next) {
    req.db.collection(databaseCollection)
    .updateOne(
        { restaurant_id: req.docID },
        req.body,
        { upsert: true },
        function (err, item) {
            if (err) throw err;
            res.status(200);
            next();
        }
    );
})
.all(function (req, res, next) {
    res.end();
    req.db.close();
})

function withDB(callback) {
    MongoClient.connect(databaseURL, function(err, db) {
        if (err) {
            console.log("Error: Database Connection Error.");
            throw err;
        }
    callback(db);
  });
};

module.exports = router;
