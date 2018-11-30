// authenticate to Twitter
var Twitter = require('twitter');
var config = require('./config.js');
var t = new Twitter(config);

const moment = require('moment');

// TODO:
// get first tweet object in array
// get screen_name
// look for screen_name in database
// if not found populate database with the user and the unix timestamp and tweet at them
// // // 
// if found check timestamp in db
// if timestamp in db is over 72 hours in past then tweet at them

const sqlite3 = require('sqlite3').verbose();

var since_id = "1068225473610698752";

var tweetAt = false;

var tweetGet = t.get('search/tweets',{"q": "citationneeded", "since_id": since_id});

tweetGet.then(function(value){

  console.log(value);

  var screen_name = value["statuses"][0]["user"].screen_name;
  var timeStamp = moment(value["statuses"][0]["created_at"], "ddd MMM DD HH:mm:ss Z YYYY", "en").unix();
  console.log(timeStamp);
  
  // open database in memory
  let db = new sqlite3.Database('screen_names.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    //console.log('Connected to the chinook database.');
  });

  db.all(`SELECT * FROM screen_names`, (err, row) => {
    if(err){
      return console.error(err.message);
    }
  
    // look for screen name in db
    for(var x=0;x<row.length;x++){
      if(row[x]["user"] == screen_name){
        // if user matches
        // meaning we have tweeted at them before

        // check time stamp
        if((timeStamp - row[x]["timestamp"]) >= (72*60*60)){
          // if time stamp is older than 72 hours ago
          // update timestamp in db
          db.run(`UPDATE screen_names SET timestamp = ? WHERE user = ?`, [timeStamp, screen_name], function(err) {
            if (err) {
              return console.error("Something " + err.message + " error happens.");
            }
            console.log(`Row(s) updated: ${this.changes}`);
           
          });

          // tweet at them
          tweetAt = true;
        } else {
          console.log("it is too soon for halloween");
        }
      }
      else{
        // new screen name
        // we have never tweeted to them before
        
        // enter them into db
        db.run(`INSERT INTO screen_names (user, timestamp) VALUES(?, ?)`, [screen_name,timeStamp], function(err) {
          if (err) {
            return console.log(err.message);
          }
          // get the last insert id
          console.log(`A row has been inserted with rowid ${this.lastID}`);
        });

        // and tweet at them
        tweetAt = true;
      }
    }

    if(tweetAt){
      console.log("tweet at these mother fathers");
    }
  
  });
 
  // close the database connection
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    //console.log('Close the database connection.');
  });
});