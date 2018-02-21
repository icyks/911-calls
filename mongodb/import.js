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




var createIndex = function(db,collection,field,type,callback) {
  // Get the documents collection
  var collection = db.collection(collection); 
  const obj = {};
  obj[field] = type;
  // Create the index
  collection.createIndex(
    obj, function(err, result) {
    console.log(result + " index created");
    callback(result);
  });
};

MongoClient.connect(mongoUrl, (err, db) => {
    insertCalls(db, result => {
        console.log(`${result.insertedCount} calls inserted`);
        createIndex(db,"calls","title","text", result=> {
            createIndex(db,"calls","cat",1, result=> {
                createIndex(db,"calls","month",1, result=> {
                    createIndex(db,"calls","year",1, result=> {
                        createIndex(db,"calls","location","2dsphere", result=> {
                            db.close();
                        })
                    })
                })
            })
        })
    });
});
