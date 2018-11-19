/*/////////////////////////////////////////////////////////////////////////////////////////////
///
///  Postmodern Article Citation Generator
///  JavaScript port of Postmodernism Generator by Andrew C. Bulhak, Monash University
///  // // // http://www.elsewhere.org/journal/pomo/
///  // // // https://github.com/orenmazor/Dada-Engine/blob/master/scripts/pomo.pb
///  // // // pomo.pb  acb  ??-09-24 AU
///  // // // pb script for generating postmodern verbiage
///  // // // Updated, format-independent version
///  // // // Copyright (C) 1995, 1996 Andrew C. Bulhak
///  // // // this script is property of acb. You are permitted to use, modify and
///  // // // distribute it as long as this notice is retained and any modifications
///  // // // in distributed copies are clearly denoted.
///  Derivative port (GPL-3.0) #NanoGenMo 2018 ZacFinger.com
///  https://github.com/zacfinger/randomfootnote/
///  https://twitter.com/randomfootnote
///
/////////////////////////////////////////////////////////////////////////////////////////////*/

/* TODO:
// generating journal titles
// // university + department + (journal || quarterly || review)
// multiple author(s) and whether or not to use initials
// // twitter character length = 280
// Fix 'candid title' so that words like "of" are not capitalized
// // more faithfully port acb's capitalization rules
// Figure out why sometimes the titles have repetitive terms
// // i.e., The reality of futility: Batailleist 'powerful communication', 
// // cultural narrative and Batailleist 'powerful communication'
// // // may want to return to randomArtMovement() type methods and define arrays locally
// google scholar link at end that links to search for the article
// // remove "of" "the" "and" "works" "in" "theory" etc
// // search https://scholar.google.com/scholar?q=words.split(" ")
// Retweet/reply to people using tag "citationneeded"
// More topics and disciplines added
// Use regex to teach yourself regular expressions
// Fix pluralise errors
// // i.e., 'Concensues of genre: The neocultural paradigm of discourse in the works of Pynchon'

Works Cited:

(01) https://github.com/orenmazor/Dada-Engine/blob/master/scripts/pomo.pb
(02) LastName, F. (2015). Interplay: neo-geo neoconceptual art of the 1980s. 
				Choice Reviews Online, 52(09), pp.52-4572-52-4572.
(03) Adam, E. (2017). Intersectional Coalitions: The Paradoxes of Rights-Based Movement Building 
				in LGBTQ and Immigrant Communities. Law & Society Review, 51(1), pp.132-167.
(04) lastname, f. (year). article title. journal name, randNum(randNum), pp.randNum-randNum.
(05) Muspratt, M. and Steeves, H. (2012). Rejecting Erasure Tropes of Africa: The Amazing Race, 
				Episodes in Ghana Counter Postcolonial Critiques. Communication, Culture & 
				Critique, 5(4), pp.533-540.
(06) http://irsc.libguides.com/mla/workscitedlist
(07) http://hypatiaphilosophy.org/for-contributors/manuscript-preparation-guidelines/
(08) McDonald, CeCe. 2017. "Go beyond our natural selves": The prison letters of CeCe McDonald. 
				Transgender Studies Quarterly 4 (2): 243–65.
(09) Rampley, Matthew. "Truth, Interpretation and the Dialectic of Nihilism." Nietzsche, 
				Aesthetics and Modernity, 3rd ser., 1, no. 2 (Spring 1999): 13-49. 
				Accessed November 18, 2018. doi:10.1017/cbo9780511663680.002
(10) https://georgiasouthern.libguides.com/c.php?g=834918&p=5961587
(11) https://en.wikipedia.org/wiki/List_of_unaccredited_institutions_of_higher_education
(12) https://areomagazine.com/2018/10/02/academic-grievance-studies-and-the-corruption-of-scholarship/

/////////////////////////////////////////////////////////////////////////////////////////////*/

// as of 11pm approximately 5 hours invested

// main.js
var Twitter = require('twitter');
var config = require('./config.js');
var pwd = require('./pwd.js'); // not sure this is the best
// pull current working directory

const fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var t = new Twitter(config);

var vcitable; // name of artist cited throughout text
var vsubject; // subject 1, 2 and 3 of paper
var vsubject2;

var volumeNumber;
var issueNumber;

var totalWords; // gotta get to 50K in the month of november to win

var prefixes = ["post","neo","sub","pre"/*, "proto"*/];
var intellectuals = ["Lacan" , "Derrida" , "Baudrillard" , "Sartre" ,
	"Foucault" , "Marx" , "Debord" , "Bataille" , "Lyotard" , "Sontag"];
var ideologies = [ 		"capitalism" , "Marxism" , "socialism" , "feminism"
						, "libertarianism" , "objectivism" , "rationalism" , "nationalism"
						, "nihilism" 
						/*, "#globalism", "#trumpism", "#accelerationism"*/
						];
var artMovements = [ 	"surrealism" , "modernism" , "realism" , "social realism"
						, "socialist realism" , "constructivism" , "expressionism"
						/*, "futurism", "retrofuturism"*/ ];
var citableArtists = [	"Burroughs" , "Joyce" , "Gibson"
						, "Stone" , "Pynchon" , "Spelling" , "Tarantino" , "Madonna" 
						, "Rushdie" , "Eco" ];
var uncitableArtists = [ "Koons" , "Mapplethorpe" , "Glass" , "Lynch" , "Fellini" , "Cage" , "McLaren" ];
var adjectivesThree = [	"structural" , "semiotic" , "modern" , "constructive" , "semantic"
						, "deconstructive" , "patriarchial" , "conceptual" , "material" ];
/*var works = {
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
};*/
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
	"capitalist",randomArrayIndex(adjectivesThree),trimE(randomArrayIndex(adjectivesThree)),
	"cultural","dialectic","textual"];
var adjectives = [
	randomArrayIndex(adjectivesTwo),(randomArrayIndex(prefixes) + randomArrayIndex(adjectivesTwo))];
var abstNounsTwo = ["sublimation", trimE(randomArrayIndex(adjectivesThree))+"ism"
	,"construction",	"appropriation",	"materialism",	"situationism"];
var abstNouns = [randomArrayIndex(abstNounsTwo),"theory","discourse",
				"narrative","de" + randomArrayIndex(abstNounsTwo)];
var bigThings = ["society" , "class" , randomArrayIndex(bigAbstThings) , "sexual identity" ];

var candidTitles = [ randomArrayIndex(doingSomethingTos) + " " + randomArrayIndex(intellectuals),
					randomArrayIndex(adjectives) + " " + pluralise(randomArrayIndex(abstNouns)),
					"The " + randomArrayIndex(concreteAdjectives) + " " + randomArrayIndex(concreteNouns),
					"The " + randomArrayIndex(somethingOfTwos) + " of " + randomArrayIndex(bigNebulousThings),
					"The " + randomArrayIndex(somethingOfTwos) + " of " + randomArrayIndex(bigThings),
					"The " + randomArrayIndex(bigNebulousThings) + " of " + randomArrayIndex(somethingOfTwos),
					pluralise(randomArrayIndex(bigNebulousThings)) + " of " + randomArrayIndex(somethingOfTwos),
					randomArrayIndex(doingSomethingToMovements) + " " + randomArrayIndex(artMovements)

];
//var authors = [randomAuthorInst(),randomAuthorInst(),randomAuthorInst()];

var terms = [termAboutIntellectual(randomArrayIndex(intellectuals)),
			randomArrayIndex(adjectives) + " " + randomArrayIndex(abstNouns),
			randomArrayIndex(adjectives) + " " + randomArrayIndex(abstNouns), 
			randomArrayIndex(adjectives) + " " + randomArrayIndex(adjectives) + " theory",
			"the " + randomArrayIndex(adjectives) + " paradigm of " + randomArrayIndex(bigNebulousThings),
			randomArrayIndex(adjectives) + " " + randomArrayIndex(ideologies)];

var titles = [
	randomTitleTwo(), titleCase(randomCandidTitle()) + ": " + capitalizeFirstLetter(randomTitleTwo())];

var jeanSuffix = [ "Michel" , "Luc" , "Jacques" , "Jean" , "Francois" ];

var genericSurnames = [ 
	"de Selby" , "Hanfkopf" , "la Fournier" , "la Tournier" , "Hamburger" ,
	// Lovecraftean scholars
	"von Junz" , "d'Erlette" , "Geoffrey" , "Prinn" ,
	// people from g09, monash.test or the AlphaLab
	"Bailey" , "Brophy" , "Cameron" , "Humphrey" , "Pickett" , "Reicher" , "Sargeant" , "Scuglia" , "Werther" , "Wilson" ,
	// net.crackpots
	"McElwaine" , "Abian" , "von Ludwig", // Plutonium's real name
	"Parry" , "Drucker" , "Dahmus" , "Dietrich", // a Monash local
	"Hubbard" ,
	// People from flat-earth, particularly those who helped with the Dada Engine
	"Porter" , "Buxton" , "Long" , "Tilton" , "Finnis" 
];

var initials = [
	"A.",'B.',"C.","D.","E.","F.","G.","H.","I.","J.","K.","L.","M.",
	"N.","O.","P.","Q.","R.","S.","T.","U.","V.","W.","X.","Y.","Z."
];

var firstNames = [ 
// French names
"Jean-" + randomArrayIndex(jeanSuffix), randomArrayIndex(jeanSuffix),
// Germanic names
	"Andreas" , "Hans" , "Rudolf" , "Wilhelm" , "Stefan" , "Helmut" , "Ludwig",
// generic or English-sounding names
	"David" , "John" , "Linda" , "Charles" , "Thomas" , "Barbara" , "Jane" , "Stephen" , "Henry" , "Agnes" , "Anna", 
	"Paul" , "Catherine" , "Martin" ];

var names = [ 
	randomArrayIndex(genericSurnames) + ", " + randomArrayIndex(firstNames) + ".",
	randomArrayIndex(genericSurnames) + ", " + randomArrayIndex(firstNames) + " " + randomArrayIndex(initials),
	randomArrayIndex(genericSurnames) + ", " + randomArrayIndex(firstNames) + " " + randomArrayIndex(initials) + randomArrayIndex(initials),
	randomArrayIndex(genericSurnames) + ", " + randomArrayIndex(initials) + " " + randomArrayIndex(firstNames) + "."	
];

// institutions from whence authors come; biased towards computer-science-type
// institutions ;-)
var universityOf = [ "California" , "Illinois" , "Georgia" , "Massachusetts",
					 "Michigan" , "North Carolina" , "Oregon" /*,"Arizona"*/ ];
// university of new sioux nation press

var somethingUniversity = [ "Oxford", "Harvard", "Cambridge", "Yale" ];

var acadInstitution = [ "Massachusetts Institute of Technology",
	"Stanford University",
	"Carnegie-Mellon University",
	"University of California, Berkeley",
	"University of Illinois",
// but who could forget Doctress Fruitopia's alma mater.....
	"University of Massachusetts, Amherst",
	"University of " + randomArrayIndex(universityOf),
	"University of " + randomArrayIndex(universityOf),
	randomArrayIndex(somethingUniversity) + " University",
	randomArrayIndex(somethingUniversity) + " University",
// ...and, of course....
	"Miskatonic University, Arkham, Mass."
];

// department
var departmentTopics = [
"English" , "Literature" , "Politics" , "Sociology" ,
	"English" , "Literature" , "Politics" , "Sociology" ,
// political correctness here
	"Gender Politics" , "Peace Studies" ,
	"Future Studies" ,
// slightly silly, perhaps
	"Ontology" , "Semiotics" , "Deconstruction" , "Sociolinguistics"
];

function randomArrayIndex(arr){
	
	try{
		var index = Math.floor((Math.random() * arr.length));

		volumeNumber = index;

		return arr[index];

	} catch (err){
	//	return "neomodernist";
		return err.message;
	}
}

function titleCase(str) {
   var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       // You do not need to check if i is larger than splitStr length, as your for does that for you
       // Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
   }
   // Directly return the joined string
   return splitStr.join(' '); 
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

/*
//return a random work from a given artist
function makeCite(artist){
	if(works.hasOwnProperty(artist))
		return randomArrayIndex(works[artist]);

	return makeCite(randomArrayIndex(citableArtists));
}*/

//return a random concept associated with an intellectual
function makeConcept(intellectual){
	if(concepts.hasOwnProperty(intellectual))
		return randomArrayIndex(concepts[intellectual]);

	return "neomodernist";

}

function pluralise(str){
	var lastChar = str[str.length-1];
	if(lastChar == "y")
		return replaceLastLetterWith(str,lastChar,"ies")
		//return str.substring(0,str.length-1) + "ies";
	if(lastChar == "s")
		return replaceLastLetterWith(str,lastChar,"ses")
		//return str.substring(0,str.length-1) + "es";

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

	return detectUndefined(capitalizeFirstLetter(randomArrayIndex(titles)));
}

function randomTitleTwo(){
	var rand = Math.random();

	issueNumber = Math.floor(rand * 10);

	if(rand >= 2/3){
		vsubject = newTerm();
	} else if (rand >= 1/3) {
		vsubject = randomArrayIndex(ideologies);
	} else {
		vsubject = randomArrayIndex(artMovements);
	}

	vsubject2 = newTerm();
	vcitable = randomArrayIndex(citableArtists);

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

function randomArtist(){
	if(Math.random() >= 0.5){
		return randomArrayIndex(citableArtists);
	}

	return randomArrayIndex(uncitableArtists);
}

function termAboutIntellectual(intellectual){
	return intellectual + "ist " + makeConcept(intellectual);
}

function newTerm(){
	return randomArrayIndex(terms);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// this doesnt really work right now
function detectUndefined(str){
	var words = str.split(" ");
	var newStr = "";
	for(var x=0;x<words.length;x++){
		if(words[x] == "undefined")
			words[x] = "'Neomodernities' ";

		newStr += words[x]

		if(x+1!=words.length)
			newStr+=" ";
	}
	return newStr;
}

function randomYear(){
	var currentYear = new Date().getFullYear();
	var lowerBound = currentYear - 24;

	return Math.floor(Math.random() * (currentYear - lowerBound) + lowerBound);
}

/*
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

function formattedAuthors(){
	return randomArrayIndex(authors);
}

function randomAuthorInst(){
	// department + acad institution
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

function adjectiviseIsm(){

}

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
}*/

function randomName(){
	return capitalizeFirstLetter(randomArrayIndex(names));
}

function randomPublication(){
	var quarterly = "";
	var rand = Math.random();

	if(rand >= 2/3){
		quarterly = "Quarterly";
	}
	else if(rand >= 1/3){
		if(Math.random() >= 4/5){
			quarterly += "Quarterly ";
		}
		
		quarterly += "Review";
	}
	else {
		if(Math.random() >= 4/5){
			quarterly += "Quarterly ";
		}

		quarterly += "Journal";
	}

	return randomArrayIndex(acadInstitution) + " Department of " + randomArrayIndex(departmentTopics) + " " + quarterly;
}

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                totalWords = rawFile.responseText;
                
            }
        }
    }
    rawFile.send(null);
}

///////// WRITE THE TWEET

readTextFile("file://"+pwd+"wordtotal");

var _randomTitle = randomTitle();

var message = randomName() + " " + randomYear() + ". \"" 
			+ _randomTitle + ".\" " + randomPublication() + " " 
			+ (volumeNumber + 1) + "(" + (issueNumber + 1) + "): " + totalWords + "-";

totalWords = Number(totalWords) + message.split(" ").length;

fs.writeFile("wordtotal", totalWords, function(err) { });

message += totalWords + ".";

console.log(message);
/*
var attachmentURL = "https://scholar.google.com/scholar?q=" + _randomTitle;

message += " " + attachmentURL;*/

//t.post('statuses/update',{"status": message});

/*
try{
	t.post('statuses/update',{"status": message, "attachment_url": attachmentURL});
} catch(e){
	//t.post('statuses/update',{"status": e.message});
	console.log("ERROR: " + e.message);
}*/
