var mongodb = require('mongodb');
var csv = require('csv-parser');
var fs = require('fs');

var MongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://localhost:27017/911-calls';

var insertCalls = function(db, callback) {
    var collection = db.collection('calls');

    var calls = [];
    fs.createReadStream('../911.csv')
        .pipe(csv())
        .on('data', data => {
            let title = data.title.split(":");
            let timeStamp = data.timeStamp.split(" ");
            let date = timeStamp[0].split("-");
            var call = {
                "lat":data.lat,
                "lng":data.lng,
                "location": {
                    type: "Point",
                    coordinates: [+data.lng,+data.lat]
                },
                "desc":data.desc,
                "zip":data.zip,
                "cat":title[0],
                "title":title[1],
                "year":date[0],
                "month":date[1],
                "day":date[2],
                "time":timeStamp[1],
                "twp":data.twp,
                "addr":data.addr,
                "e":data.e
            }; 
            calls.push(call);
        })
        .on('end', () => {
          collection.insertMany(calls, (err, result) => {
            callback(result)
          });
        });
}

var createTextIndex = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('calls');
  // Create the index
  collection.createIndex(
    { title : "text" }, function(err, result) {
    console.log(result + " textindex created");
    callback(result);
  });
};

var create2DSphereIndex = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('calls');
  // Create the index
  collection.createIndex(
    { location : "2dsphere" }, function(err, result) {
        if (err) {
            console.log(err);
            throw err;
        }
    console.log(result+ "2dsphereindex created");
    callback(result);
  });
};

var createIndexMonth = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('calls');
  // Create the index
  collection.createIndex(
    { month : 1 }, function(err, result) {
    console.log(result + "index created");
    callback(result);
  });
};

var createIndexYear = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('calls');
  // Create the index
  collection.createIndex(
    { year : 1 }, function(err, result) {
    console.log(result + "index created");
    callback(result);
  });
};
var createIndexCat = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('calls');
  // Create the index
  collection.createIndex(
    { cat : 1 }, function(err, result) {
    console.log(result + "index created");
    callback(result);
  });
};

MongoClient.connect(mongoUrl, (err, db) => {
    insertCalls(db, result => {
        console.log(`${result.insertedCount} calls inserted`);
        createTextIndex(db, result1=> {
            createIndexCat(db, result2=> {
                createIndexMonth(db, result3=> {
                    createIndexYear(db, result4=> {
                        create2DSphereIndex(db, result5=> {
                            db.close();
                        })
                    })
                })
            })
        })
    });
});
