/*/////////////////////////////////////////////////////////////////////////////////////////////
///
///  Postmodern Article Citation Generator v0.1
///  (GPL-3.0) #NanoGenMo 2018 ZacFinger.com
///  https://github.com/zacfinger/randomfootnote/
///  https://twitter.com/randomfootnote
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
///
/////////////////////////////////////////////////////////////////////////////////////////////*/

/* ////////////////////////////////////////////////////////////////////////////////////////////
///
/// Modifications to acb's original generated article titles:
/// 
/// // Publication names derived from acb's "Department of
///    [Topic], [Academic Institution Name]" format now read: 
///    "[Academic Institution Name] [Topic] [ Quarterly || 
///    Review || Journal || Quarterly Review || Quarterly Journal ]"
///
/// // Author names are always initials, except for the surname
///    The full first names are still generated via acb's method
///    but only the first index of the string is used for the name
///
/// // For forming the bibliography I am now using a composite
///    of the Chicago Manual of Style, MLA, and the format
///    recommended by Hypatia journal.
/// 
/////////////////////////////////////////////////////////////////////////////////////////////*/

/* ////////////////////////////////////////////////////////////////////////////////////////////
///
/// Deployment guide:
/// 
/// (1) Copy to repo on live server
/// (2) Create file "wordtotal" with value "0"
/// (3) Create file "pwd.js" with value:
/// 	module.exports = "/path/to/current/working/dir/";
/// (4) Create empty file "since_id"
/// (5) Set cron job to run at desired frequency
/// 
/////////////////////////////////////////////////////////////////////////////////////////////*/

/*/////////////////////////////////////////////////////////////////////////////////////////////
///
/// TO DO:
///
/// TODO: figure out why word count is wrong when tweeting code is called in a function
/// ideally randomTweet(in_reply_to_id) method which takes in an ID to tweet at
/// this is a problem with asynchronous calls
///
/// TODO: Fix 'candid title' so that words like "of" are not capitalized
/// // more faithfully port acb's capitalization rules
///
/// TODO: consider tweeting #nanoGenMo if currentMonth() == November

// TODO: Retweet/reply to people using tag "citationneeded"
// and tag "citeyoursources"

// TODO: Figure out why sometimes the titles have repetitive terms
// // i.e., The reality of futility: Batailleist 'powerful communication', 
// // cultural narrative and Batailleist 'powerful communication'

// TODO: may want to return to randomArtMovement() type methods and define arrays locally
// algorithm is weird because it is reverse engineered from acb's pb script
// Refactor so that it is not so messy

// TODO: More topics, universities and disciplines needed to approach SCIgen similarity

// TODO: Use regex to teach yourself regular expressions

/////////////////////////////////////////////////////////////////////////////////////////////

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

// authenticate to Twitter
var Twitter = require('twitter');
var config = require('./config.js');
var t = new Twitter(config);

// Not sure this is the best implementation 
// for pulling the current working directory
// working with local files need PWD as string
var pwd = require('./pwd.js'); 

// Other dependencies
const fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// Article final title subjects
var vsubject;
var vsubject2;

// Volume and issue numbers, 
// derived from the indices
// used to look up random values
// in word bank arrays
var volumeNumber;
var issueNumber;

// gotta get to 50K in the month of november to win #nanogenmo
// running count of total words ever generated by the bot
// stored in local value /wordtotal and referenced in main.js
// as totalWords when the file is opened by fs
var totalWords; 

// set of prefixes to use in ideology 
// and art movement constructionisms
var prefixes = ["post","neo","sub","pre"/*, "proto"*/];

// set of names cited in the paper title
var intellectuals = ["Lacan" , "Derrida" , "Baudrillard" , "Sartre" , "Foucault" , 
                     "Marx" , "Debord" , "Bataille" , "Lyotard" , "Sontag"];

// set of base ideologies and movements from 
// which to create terms such as hypermodernism
var ideologies = [ 		"capitalism" , "Marxism" , "socialism" , "feminism" , "libertarianism" , 
                        "objectivism" , "rationalism" , "nationalism" , "nihilism" 
						/*, "#globalism", "#trumpism", "#accelerationism"*/];
var artMovements = [ 	"surrealism" , "modernism" , "realism" , "social realism" ,
                        "socialist realism" , "constructivism" , "expressionism"
						/*, "futurism", "retrofuturism"*/ ];
var citableArtists = [	"Burroughs" , "Joyce" , "Gibson" , "Stone" , "Pynchon" , 
						"Spelling" , "Tarantino" , "Madonna", "Rushdie" , "Eco" ];

var uncitableArtists = [ "Koons" , "Mapplethorpe" , "Glass" , "Lynch" , "Fellini" , "Cage" , "McLaren" ];
var adjectivesThree = [	"structural" , "semiotic" , "modern" , "constructive" , "semantic"
						, "deconstructive" , "patriarchial" , "conceptual" , "material" ];

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
var bigNebulousThings = ["reality" , "discourse" , "consensus" , "expression"
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
	"A","B","C","D","E","F","G","H","I","J","K","L","M",
	"N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
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
	randomArrayIndex(genericSurnames) + ", " + randomArrayIndex(firstNames)[0] + ".",
	randomArrayIndex(genericSurnames) + ", " + randomArrayIndex(firstNames)[0] + "." + randomArrayIndex(initials)[0] + ".",
	randomArrayIndex(genericSurnames) + ", " + randomArrayIndex(firstNames)[0] + "." + randomArrayIndex(initials)[0] + "." + randomArrayIndex(initials)[0] + ".",
	randomArrayIndex(genericSurnames) + ", " + randomArrayIndex(initials)[0] + "." + randomArrayIndex(firstNames)[0] + "."
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
var departmentTopics = [ // "Social Technology",
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

		volumeNumber = index * 2;

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

	_randomTitle = detectUndefined(capitalizeFirstLetter(randomTitleTwo()));

	if(Math.random() >= 0.5){

		_randomTitle = detectUndefined(capitalizeFirstLetter(
		titleCase(randomCandidTitle()) + ": " + capitalizeFirstLetter(_randomTitle)));

		
	}

	return _randomTitle; 

	//return detectUndefined(capitalizeFirstLetter(randomArrayIndex(titles)));
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
	
	var titlesTwo = [
	vsubject + " in the works of " + randomArrayIndex(citableArtists), 
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
	// returns random year between now and 20 years ago
	var currentYear = new Date().getFullYear();
	var lowerBound = currentYear - 20;

	return Math.floor(Math.random() * (currentYear - lowerBound) + lowerBound);
}

/*
function randomIdeology(){ return randomArrayIndex(ideologies); }
function randomArtMovement(){ return randomArrayIndex(artMovements);}
*/

function randomName(){

	if(Math.random() > 1/3){
		return capitalizeFirstLetter(randomArrayIndex(names));
	}
	else {
		return capitalizeFirstLetter(randomArrayIndex(names)) + " and " + capitalizeFirstLetter(randomArrayIndex(names));
	}
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

	return randomArrayIndex(acadInstitution) + /*" Department of "*/" " + randomArrayIndex(departmentTopics) + " " + quarterly;
}

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    var temp;
    
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                //totalWords = rawFile.responseText;
                temp = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    return temp;
}

function makeGoogleScholarURL(str){
	var wordArray = str.split(" ");
	var url = "https://scholar.google.com/scholar?q=";
	var tempWord = "";

	for(var x=0;x<wordArray.length;x++){
		tempWord = wordArray[x].toLowerCase()

		if(tempWord != "of" && tempWord != "and"
		&& tempWord != "the" && tempWord != "in"
		&& tempWord != "works"){

			if(tempWord[0] == "'"){
				tempWord = tempWord.substr(1,tempWord.length);
			}

			if(tempWord[tempWord.length - 1] == ","
			|| tempWord[tempWord.length - 1] == ":"
			|| tempWord[tempWord.length - 1] == "'"){
				url += tempWord.substr(0,tempWord.length-1);

			} else {
				url += tempWord;
			}
			

			if(x+1 != wordArray.length){
			url += "+";
			}
		}
	}

	return url;
}

///////// GET ALL THE TWEETS

// global since ID parameter
// if since ID file is not empty
// // set q object with parameter since_id 
// query twitter with q object for keyword citationneeded 
// if json response has property since_id was in the query
// set y to json response length (entire array of tweets)
// if json response since_id was not in query
// // first time ever running
// // set y to 1
// query for x=0, x<y every first response in the query, tweet back at them and log the id at the last
// or first one depending on which one is the "latest"

// set value in file to since_ID
// // on first run since_ID is set to 
// if since_ID nonexistent
// get all tweets since_ID
// 

var since_id = readTextFile("file://"+pwd+"since_id");


var tweetGet = t.get('search/tweets',{"q": "citationneeded", "since_id": since_id});

tweetGet.then(function(value){
if(value["statuses"][0]!=undefined){
	
	var in_reply_to_status_id = value["statuses"][0].id_str;
console.log(in_reply_to_status_id);
var screen_name = value["statuses"][0]["user"].screen_name;
console.log(screen_name);

fs.writeFile("since_id", in_reply_to_status_id, function(err) { 
});

// occasionally vsubject or vsubject2 or ocassaionally both are set to keywords from the tweets themselves

totalWords = readTextFile("file://"+pwd+"wordtotal");

var message = "@" + screen_name + ": " + randomName() + " " + randomYear() + ". \"" 
			+ randomTitle() + ".\" " + randomPublication() + " vol. " 
			+ (volumeNumber + 2) + ", no. " + (issueNumber + 1) + ": pp." + totalWords + "-";

totalWords = Number(totalWords) + message.split(" ").length - 1;

fs.writeFile("wordtotal", totalWords, function(err) { 
});

message += totalWords + ". " + makeGoogleScholarURL(_randomTitle)/* + " #citationneeded"*/;

///////// WRITE THE TWEET

//function randomTweet(){
//	console.log(readTextFile("file://"+pwd+"wordtotal"));
//totalWords = readTextFile("file://"+pwd+"wordtotal");
/*readTextFile("file://"+pwd+"wordtotal");

var message = randomName() + " " + randomYear() + ". \"" 
			+ randomTitle() + ".\" " + randomPublication() + " vol. " 
			+ (volumeNumber + 2) + ", no. " + (issueNumber + 1) + ": pp." + totalWords + "-";

totalWords = Number(totalWords) + message.split(" ").length;

fs.writeFile("wordtotal", totalWords, function(err) { 

});

message += totalWords + ". " + makeGoogleScholarURL(_randomTitle)/* + " #citationneeded"*///;

//return message;
//}
console.log(message);


	t.post('statuses/update',{"status": message, "in_reply_to_status_id": in_reply_to_status_id,
"auto_populate_reply_metadata": true}, function(req, res) {
    //console.log('Requesting posts');
    //post.find({})
        //.exec()
        //.then(function(posts) {
       //     res.json(posts);
        //    console.log(posts);
        //})
        //.catch(function(error){
        //    console.log('Error getting the posts');
        //});
        console.log(res);
	});


} else {
	console.log("no recent tweets matching query");
}


});

