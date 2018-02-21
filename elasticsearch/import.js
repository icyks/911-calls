var elasticsearch = require('elasticsearch');
var csv = require('csv-parser');
var fs = require('fs');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});



// Création de l'indice
client.indices.create({ index: "911calls" }, (err, resp) => {
  if (err) 
  	{ 
  		console.trace(err.message);
  		return;
  	}
  client.indices.putMapping({
  		index:"911calls",
  		type: "call",
  		body: {
  			call: {
  				properties: {
  					location : {
  						type: "geo_point"
  					}
  				}
  			}
  		}
  	}); 
  client.indices.putMapping({
      index:"911calls",
      type: "call",
      body: {
        call: {
          properties: {
            time : {
              type: "date",
              format: "yyyy-MM-dd HH:mm:ss"
            }
          }
        }
      }
    }); 
});


let calls = [];
fs.createReadStream('../911.csv')
    .pipe(csv())
    .on('data', data => {
    	let title = data.title.split(":");
        let timeStamp = data.timeStamp.split(" ");
        let date = timeStamp[0].split("-");
		calls.push({
                location:{
                	lon:+data.lng,
                  lat: +data.lat
                },
                desc:data.desc,
                zip:data.zip,
               	cat:title[0],
                title:title[1],
                date:date[0]+"/"+date[1],
                time:data.timeStamp,
                twp:data.twp,
                addr:data.addr,
                e:data.e
        });
	})
    .on('end', () => {
	  	client.bulk(createBulkInsertQuery(calls), (err, resp) => {
		    if (err) console.trace(err.message);
		    else console.log(`Inserted ${resp.items.length} calls`);
		    client.close();
	    });
    });



// Fonction utilitaire permettant de formatter les données pour l'insertion "bulk" dans elastic
function createBulkInsertQuery(calls) {
  const body = calls.reduce((acc, call) => {
    const { location, desc,zip,cat,title,date,time,twp,addr,e } = call;
    acc.push({ index: { _index: '911calls', _type: 'call'} })
    acc.push(call)
    return acc
  }, []);

  return { body };
}


