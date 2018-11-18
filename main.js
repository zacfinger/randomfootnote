// main.js
var Twitter = require('twitter');
var config = require('./config.js');

var t = new Twitter(config);

/*//////////////

LastName, F. (2015). Interplay: neo-geo neoconceptual art of the 1980s. Choice Reviews Online, 52(09), pp.52-4572-52-4572.
Adam, E. (2017). Intersectional Coalitions: The Paradoxes of Rights-Based Movement Building in LGBTQ and Immigrant Communities. Law & Society Review, 51(1), pp.132-167.

lastname, f. (year). article title. journal name, randNum(randNum), pp.randNum-randNum-randNum-randNum.

*/

var vcitable; // name of artist cited throughout text
var vsubject; // subject 1, 2 and 3 of paper
var vsubject2;
var vsubject3;
var ideologies = [ 		"capitalism" , "Marxism" , "socialism" , "feminism"
						, "libertarianism" , "objectivism" , "rationalism" , "nationalism"
						, "nihilism" ];
var artMovements = [ 	"surrealism" , "modernism" , "realism" , "social realism"
						, "socialist realism" , "constructvism" , "expressionism"
						/*, "futurism", "retrofuturism"*/ ];
var citableArtists = [	"Burroughs" , "Joyce" , "Gibson"
						, "Stone" , "Pynchon" , "Spelling" , "Tarantino" , "Madonna" 
						, "Rushdie" , "Eco" ];
var uncitableArtists = [ "Koons" , "Mapplethorpe" , "Glass" , "Lynch" , "Fellini" , "Cage" , "McLaren" ];
var adjectivesThree = [	"structural" , "semiotic" , "modern" , "constructive" , "semantic"
						, "deconstructive" , "patriarchial" , "conceptual" , "material" ];




function trimE (str){
	// consider making this a regular expression
	if(str[str.length-1] == "e"){
		return str.substring(0,str.length-1) + "ist";
	}
}

function randomTitle(){
	var titles = [
	randomTitleTwo(), randomCandidTitle() + ": " + randomTitleTwo()];
	var index = Math.floor((Math.random() * titles.length));

	return titles[index];
}

function randomTitleTwo(){
	var rand = Math.random();
	if(rand >= 2/3){
		vsubject = newTerm();
	} else if (rand >= 1/3) {
		vsubject = randomIdeology();
	} else {
		vsubject = randomArtMovement();
	}

	vsubject2 = newTerm();
	vcitable = randomCitableArtist();

	var titles = [
	vsubject + " in the works of " + vcitable, 
	vsubject + " in the works of " + randomArtist(),
	twoTermTitle(vsubject,vsubject2),
	threeTermTitle(vsubject,vsubject2,newTerm())
	];

	var index = Math.floor((Math.random() * titles.length));

	return titles[index];

	
}

function randomArrayIndex(arr){
	var index = Math.floor((Math.random() * arr.length));
	return arr[index];
	

}

function randomIdeology(){
	return randomArrayIndex(ideologies);

}

function randomArtMovement(){
	return randomArrayIndex(artMovement);


}

function randomArtist(){
	if(Math.random() >= 0.5){
		return randomCitableArtist();
	}

	return randomUncitableArtist();
}

function randomCitableArtist(){

	return randomArrayIndex(citableArtists);
}

function randomUncitableArtist(){

	return randomArrayIndex(uncitableArtists);
		
}

function twoTermTitle(foo,bar){
	if(Math.random() >= 0.5){
		return foo + " and " + bar; 
	}

	return bar + " and " + foo;
}

function threeTermTitle(foo,bar,baz){
	var titles = [
	foo + ", " + bar + " and " + baz,
	bar + ", " + foo + " and " + baz,
	bar + ", " + baz + " and " + foo,
	baz + ", " + foo + " and " + bar,
	baz + ", " + bar + " and " + foo

	];

	var index = Math.floor((Math.random() * titles.length));

	return titles[index];
}

function randomModifierPrefix(){
	var prefixes = ["post","neo","sub","pre"];
	var index = Math.floor((Math.random() * prefixes.length));

	return prefixes[index];
}

function randomAdjective(){
	var adjectives = [
	randomAdjectiveTwo(),randomModifierPrefix() + randomAdjectiveTwo()];

	var index = Math.floor((Math.random() * adjectives.length));

	return adjectives[index];
}

function randomAdjectiveTwo(){
	var adjectives = [
	"capitalist",randomAdjectiveThree(),trimE(randomAdjectiveThree()),
	"cultural","dialectic","textual"];

	var index = Math.floor((Math.random() * adjectives.length));

	return adjectives[index];
	
}

function randomAdjectiveThree(){
	
	return randomArrayIndex(adjectivesThree);

	//return "neomodernist";
}

console.log(randomTitle());

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