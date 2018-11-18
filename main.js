// main.js
var Twitter = require('twitter');
var config = require('./config.js');

var t = new Twitter(config);

var vcitable; // name of artist cited throughout text
var vsubject; // subject 1, 2 and 3 of paper
var vsubject2;
var vsubject3;

function trimE (str){
	// consider making this a regular expression
	if(str[str.length-1] == "e"){
		return str.substring(0,str.length-1) + "ist";
	}
}

function randomModifierPrefix(){
	var prefixes = ["post","neo","sub","pre"];
	console.log(prefixes);
	var index = Math.floor((Math.random() * prefixes.length-1));
	return prefixes[index];
}




//var message = "";

//t.post('statuses/update',{"status": message});
	
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