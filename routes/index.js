var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

var databaseName = 'test'
var databaseURL = 'mongodb://127.0.0.1:27017/' + databaseName;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'JuxtaPros 2' });
});

router.param('document', function (req, res, next, document) {
  withDB(function (db) {
    db.collection('restaurants')
    .find({'restaurant_id': document})
    .limit(1)
    .toArray(function (err, result) {
      if (err) throw err;
      req.document = result[0];
      db.close();
      next();
    });
  });
});

router.get('/doc/:document', function(req, res, next) {
  var str = (req.document) ? req.document.name : "Restaurant not found.";
  res.render('dbtest', { title: 'Database Query', body: str });
});

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
