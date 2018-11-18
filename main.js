// main.js
var Twitter = require('twitter');
var config = require('./config.js');

var t = new Twitter(config);

var message = "this is now being sent to the api post method call as a parameter called message";

t.post('statuses/update',{"status": message});
	
/*
setTimeout(function(){
   		try {
		     Twitter.post('statuses/update', {"status": message, "in_reply_to_status_id":tweet_id}, function(error, tweet, response){
			      console.log("Tweet posted successfully!")
  			 });
  		}

  		catch(err) {
  		    console.log(err);
  		}},3000*i);
    
   }*/