/*//////////////

Postmodern Article Citation Generator
// // // JavaScript port of Andrew C. Bulhak's
// // // pb script for generating postmodern verbiage
(GPL-3.0) 2018 ZacFinger.com.
https://github.com/zacfinger/randomfootnote/
https://twitter.com/randomfootnote

// pomo.pb  acb  ??-09-24 AU
// pb script for generating postmodern verbiage
// Updated, format-independent version
// Copyright (C) 1995, 1996 Andrew C. Bulhak
// this script is property of acb. You are permitted to use, modify and
// distribute it as long as this notice is retained and any modifications
// in distributed copies are clearly denoted.

Based in whole or in part on:

(1) https://github.com/orenmazor/Dada-Engine/blob/master/scripts/pomo.pb
(2) LastName, F. (2015). Interplay: neo-geo neoconceptual art of the 1980s. Choice Reviews Online, 52(09), pp.52-4572-52-4572.
(3) Adam, E. (2017). Intersectional Coalitions: The Paradoxes of Rights-Based Movement Building in LGBTQ and Immigrant Communities. Law & Society Review, 51(1), pp.132-167.
(4) lastname, f. (year). article title. journal name, randNum(randNum), pp.randNum-randNum.
(5) Muspratt, M. and Steeves, H. (2012). Rejecting Erasure Tropes of Africa: The Amazing Race, Episodes in Ghana Counter Postcolonial Critiques. Communication, Culture & Critique, 5(4), pp.533-540.

*/

// began work at 1005, took break 1125 to 1153 to cook and eat breakfast
// took another break at 1300

// main.js
var Twitter = require('twitter');
var config = require('./config.js');

var t = new Twitter(config);

var vcitable; // name of artist cited throughout text
var vsubject; // subject 1, 2 and 3 of paper
var vsubject2;
var vsubject3;
var prefixes = ["post","neo","sub","pre"];
var intellectuals = ["Lacan" , "Derrida" , "Baudrillard" , "Sartre" ,
	"Foucault" , "Marx" , "Debord" , "Bataille" , "Lyotard" , "Sontag"];
var ideologies = [ 		"capitalism" , "Marxism" , "socialism" , "feminism"
						, "libertarianism" , "objectivism" , "rationalism" , "nationalism"
						, "nihilism" ];
var artMovements = [ 	"surrealism" , "modernism" , "realism" , "social realism"
						, "socialist realism" , "constructivism" , "expressionism"
						/*, "futurism", "retrofuturism"*/ ];
var citableArtists = [	"Burroughs" , "Joyce" , "Gibson"
						, "Stone" , "Pynchon" , "Spelling" , "Tarantino" , "Madonna" 
						, "Rushdie" , "Eco" ];
var uncitableArtists = [ "Koons" , "Mapplethorpe" , "Glass" , "Lynch" , "Fellini" , "Cage" , "McLaren" ];
var adjectivesThree = [	"structural" , "semiotic" , "modern" , "constructive" , "semantic"
						, "deconstructive" , "patriarchial" , "conceptual" , "material" ];
var works = {
"Spelling": ["Beverly Hills 90210","Melrose Place","Models,Inc."],
"Pynchon": ["Gravity's Rainbow","Vineland","The Crying of Lot 49"],
"Stone": ["JFK","Natural Born Killers","Heaven and Earth","Platoon"],
"Tarantino":["Reservoir Dogs","Pulp Fiction","Clerks"],//Tarantino did NOT do Clerks
"Fellini":["8 1/2"],
"Burroughs": ["The Naked Lunch","The Soft Machine","Queer","Port of Saints","Junky",
			"The Ticket That Exploded","Nova Express","The Last Words of Dutch Schultz"],
"Joyce": ["Ulysses","Finnegan's Wake"],
"Gibson": ["Neuromancer","The Burning Chrome","Mona Lisa Overdrive","Virtual Light"],
"Madonna": ["Erotica","Sex","Material Girl"],
"Rushdie": ["Satanic Verses","Midnight's Children"],
"Eco": ["The Name of the Rose","Foucault's Pendulum"]
};
var concepts = {
"Lacan": ["obscurity"],
"Derrida": ["reading"],
"Baudrillard": ["simulation","simulacra","hyperreality"],
"Sartre": ["absurdity","existentialism"],
"Foucault": ["panopticon","power relations"],
"Marx": ["capitalism","socialism","class"],
"Debord": ["image","situation"],
"Bataille":["'powerful communication'"],
"Lyotard": ["narrative"],
"Sontag": ["camp"]
};
var concreteAdjectives = ["vermillion" , "circular" , "broken" , "forgotten",
 						"stone"	, "iron" , "burning"];
var concreteNouns = ["door" , "fruit" , "key" , "sky" , "sea" , "house"];
var doingSomethingTos = ["reading" , "deconstructing" , "forgetting"];
var doingSomethingToMovements = ["reinventing" , "deconstructing", "reassessing"];
var bigNebulousThings = ["reality" , "discourse" , "concensus" , "expression"
	, "narrative" , "context" ];
var somethingOfTwos = ["failure" , "futility" , "collapse" , "fatal flaw"
	, "rubicon" , "stasis" , "meaninglessness" , "absurdity" , "paradigm"
	, "genre" , "defining characteristic" , "dialectic" , "economy" ];
var bigAbstThings = ["culture" , "language" , "art" , "reality" , "truth" 
	, "sexuality" , "narrativity" , "consciousness"];
var adjectivesTwo = [
	"capitalist",randomAdjectiveThree(),trimE(randomAdjectiveThree()),
	"cultural","dialectic","textual"];
var adjectives = [
	randomAdjectiveTwo(),(randomModifierPrefix() + randomAdjectiveTwo())];
var abstNounsTwo = ["sublimation", trimE(randomAdjectiveThree())+"ism"
	,"construction",	"appropriation",	"materialism",	"situationism"];
var abstNouns = [randomAbstNounTwo(),"theory","discourse",
				"narrative","de" + randomAbstNounTwo()];
var bigThings = ["society" , "class" , randomBigAbstThing() , "sexual identity" ];

var candidTitles = [ randomDoingSomethingTo() + " " + randomIntellectual(),
					randomAdjective() + " " + pluralise(randomAbstNoun()),
					"The " + randomConcreteAdjective() + " " + randomConcreteNoun(),
					"The " + somethingOfTwo() + " of " + randomBigNebulousThing(),
					"The " + somethingOfTwo() + " of " + randomBigThing(),
					"The " + randomBigNebulousThing() + " of " + somethingOfTwo(),
					pluralise(randomBigNebulousThing()) + " of " + somethingOfTwo(),
					randomDoingSomethingToMovement() + " " + randomArtMovement()

];
//var authors = [randomAuthorInst(),randomAuthorInst(),randomAuthorInst()];


var terms = [termAboutIntellectual(randomIntellectual()),
			randomAdjective() + " " + randomAbstNoun(),
			randomAdjective() + " " + randomAbstNoun(), 
			randomAdjective() + " " + randomAdjective() + " theory",
			"the " + randomAdjective() + " paradigm of " + randomBigNebulousThing(),
			randomAdjective() + " " + randomIdeology()];

var titles = [
	randomTitleTwo(), randomCandidTitle() + ": " + randomTitleTwo()];


function randomArrayIndex(arr){
	//console.log(arr);
	//try{
	var index = Math.floor((Math.random() * arr.length));
	//console.log(arr.length);

	return arr[index];
	//} catch (err){
	//	console.log("array: " + arr)
	//	return "neomodernist";
		// return randomArrayIndex(err.message.split(" "));
	//}
	

}

// turns deconstructive into deconstrucitivist 
function trimE (str){
	// consider making this a regular expression
	if(str[str.length-1] == "e"){
		return str.substring(0,str.length-1) + "ist";
	}
	return str;
}

function stripThe(str){
	if(str.substring(0,4).toLowerCase() == "the ")
		return str.substring(4,str.length-1);
	return str;
}

//return a random work from a given artist
function makeCite(artist){
	if(works.hasOwnProperty(artist))
		return randomArrayIndex(works[artist]);

	return makeCite(randomCitableArtist());
}

//return a random concept associated with an intellectual
function makeConcept(intellectual){
	if(concepts.hasOwnProperty(intellectual))
		return randomArrayIndex(concepts[intellectual]);

	return "neomodernist";

}

function pluralise(str){
	var lastChar = str[str.length-1];
	if(lastChar == "y")
		return str.substring(0,str.length-1) + "ies";
	if(lastChar == "s")
		return str.substring(0,str.length-1) + "es";

	return str + "s";
}

function pastTensify(str){

	return replaceLastLetterWith(str,"e","ed");
}

function replaceLastLetterWith(str,oldLastLetter,newLastLetter){
	var lastChar = str[str.length-1];

	if(lastChar == oldLastLetter)
		return str.substring(0,str.length-1) + newLastLetter;

	return str + newLastLetter;
}

function randomTitle(){
	
	return randomArrayIndex(titles);
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

	var titlesTwo = [
	vsubject + " in the works of " + vcitable, 
	vsubject + " in the works of " + randomArtist(),
	twoTermTitle(vsubject,vsubject2),
	threeTermTitle(vsubject,vsubject2,newTerm())
	];

	return randomArrayIndex(titlesTwo);

	
}

function twoTermTitle(foo,bar){
	if(Math.random() >= 0.5){
		return foo + " and " + bar; 
	}

	return bar + " and " + foo;
}

function threeTermTitle(foo,bar,baz){
	var threeTermTitles = [
	foo + ", " + bar + " and " + baz,
	bar + ", " + foo + " and " + baz,
	bar + ", " + baz + " and " + foo,
	baz + ", " + foo + " and " + bar,
	baz + ", " + bar + " and " + foo

	];

	return randomArrayIndex(threeTermTitles);
}

function randomCandidTitle(){
	return randomArrayIndex(candidTitles);
}

function randomConcreteAdjective(){
	return randomArrayIndex(concreteAdjectives);
}

function randomConcreteNoun(){
	return randomArrayIndex(concreteNouns);
}

function randomDoingSomethingTo(){
	return randomArrayIndex(doingSomethingTos);
}

function randomDoingSomethingToMovement(){
	return randomArrayIndex(doingSomethingToMovements);
}
/*
function formattedAuthors(){
	return randomArrayIndex(authors);
}

function randomAuthorInst(){
	// department + acad institution
}*/

function termAboutIntellectual(intellectual){
	return intellectual + "ist " + makeConcept(intellectual);
}

function somethingOfTwo(){
	return randomArrayIndex(somethingOfTwos);
}

function randomIdeology(){
	return randomArrayIndex(ideologies);

}

function randomArtMovement(){
	return randomArrayIndex(artMovements);


}
/*
function adjectiviseIsm(){

}*/

// adjectives
// adverbs

function randomBigNebulousThing(){
	return randomArrayIndex(bigNebulousThings);
}

function randomBigThing(){
	return randomArrayIndex(bigThings);
}

function randomBigAbstThing(){
	return randomArrayIndex(bigAbstThings);
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

function randomIntellectual(){
	return randomArrayIndex(intellectuals);
}

function randomModifierPrefix(){
	
	return randomArrayIndex(prefixes);
}

function randomAdjective(){
	

	return randomArrayIndex(adjectives);
}

function randomAdjectiveTwo(){
	
//return "blah";
	return randomArrayIndex(adjectivesTwo);
	
}

function randomAdjectiveThree(){
	
	return randomArrayIndex(adjectivesThree);

	//return "neomodernist";
}

function randomAbstNoun(){
	return randomArrayIndex(abstNouns);
}

function randomAbstNounTwo(){
	return randomArrayIndex(abstNounsTwo);
}

function newTerm(){
	return randomArrayIndex(terms);
}

console.log(
	randomTitle()
);



//var message = randomTitle() + " " + formattedAuthors();

//t.post('statuses/update',{"status": message});
/*
try{
	t.post('statuses/update',{"status": randomTitle()});
} catch(err){
	t.post('statuses/update',{"status": err.message});
}*/
