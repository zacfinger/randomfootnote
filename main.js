/*//////////////////////////////////////////////////////////////////////////////
///
///  Postmodern Article Citation Generator v0.2.1
///  (GPL-3.0) #NanoGenMo 2018-2021 ZacFinger.com
///  https://github.com/zacfinger/randomfootnote/
///  https://twitter.com/randomfootnote
///  NodeJS port of Postmodernism Generator by:
///  // // Andrew C. Bulhak, Monash University
///  // // http://www.elsewhere.org/journal/pomo/
///  // // https://github.com/orenmazor/Dada-Engine/blob/master/scripts/pomo.pb
///  // // pomo.pb  acb  ??-09-24 AU
///  // // pb script for generating postmodern verbiage
///  // // Updated, format-independent version
///  // // Copyright (C) 1995, 1996 Andrew C. Bulhak
///  // // this script is property of acb. You are permitted to use, modify and
///  // // distribute it as long as this notice is retained and any 
///  // // modifications in distributed copies are clearly denoted.
///
//////////////////////////////////////////////////////////////////////////////*/

/*//////////////////////////////////////////////////////////////////////////////
///
/// Modifications to acb's original generated article titles:
/// 
/// // Publication names derived from acb's "Department of
///    [Topic], [Academic Institution Name]" format now read: 
///    "[Academic Institution Name] [Topic] [ Quarterly || 
///    Review || Journal || Quarterly Review || Quarterly Journal ]"
///
/// // Author names are always initials, except for the surname.
///    The full first names are still generated via acb's method
///    but only the first index of the string is used for the name.
///
/// // For forming the bibliography I am now using a composite
///    of the Chicago Manual of Style, MLA, and the format
///    recommended by Hypatia journal.
/// 
//////////////////////////////////////////////////////////////////////////////*/

/*//////////////////////////////////////////////////////////////////////////////
///
/// Deployment guide:
///
/// This guide assumes an Ubuntu 16.04 server with the following dependencies
/// installed: 
/// // node
/// // sqlite3
/// // twitter
/// // xmlhttprequest
/// // moment
/// // randomBytes
/// 
/// (1) Copy repo to live server by issuing the following command in your
///     application directory:
///     > git clone https://github.com/zacfinger/randomfootnote.git
/// (2) Create file "config.js" with value:
///
///     module.exports = {
///                          consumer_key: 'yourConsumerKey',
///                          consumer_secret: 'yourConsumerSecret',
///                          access_token_key: 'yourAccessTokenKey',
///                          access_token_secret: 'yourAccessTokenSecret'
///     }
///
///     See Twitter's documentation for authenticating your application:
///     https://developer.twitter.com/en/docs/basics/
///     authentication/overview/oauth
/// (3) Create file "pwd.js" with value:
///     module.exports = "/path/to/current/working/dir/";
/// (4) Create a new sqlite3 database called "screen_names.db" with table
///     "screen_names" by running the below commands in the app directory:
///     > sqlite3 screen_names.db
///     sqlite> create table screen_names(user text, timestamp integer);
///     Use ctrl-D to exit. Refer to https://www.sqlite.org/cli.html
/// (2) Create file "word.total" with value "0"
/// (4) Create empty file "since.id"
/// (5) Set crontab to run at desired frequency
/// (6) Call "node main.js" to query Twitter, construct the Tweet, and reply to
///     the user. Call "node main.js 1" to display the constructed message,
///     without tweeting the user.
/// 
//////////////////////////////////////////////////////////////////////////////*/

/*//////////////////////////////////////////////////////////////////////////////
///
/// TO DO:
/// 
/// TODO: If any exceptions are ever thrown these are somehow used in the
/// randomTitle() method
/// 
/// TODO: replace entirely the 'pwd' implementation with:
/// // const path = require('path');
/// // const dbPath = path.resolve(__dirpath,'screen_names.db');
/// // let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
///
/// TODO: Set SQLITE3 database to log users earlier in the thread as well, not
/// just the "reply to" user
/// 
/// TODO: Set vsubject and vsubject2 to the two keywords in the tweet before the
/// tweet that the bot is responding to. Grab the first tweet, grab the "in_
/// reply_to_status_id", grab that tweet, parse the tweet through a 
/// summarization library, set vsubject and vsubject2 to the two keywords.
///
/// TODO: Get cron task working, not sure why it is failing now. Other node
/// jobs in the same crontab but in a different directory are working. "Node"
/// command is used in both, but in the working implementation arguments are 
/// passed and output is sent to a file.
///
/// TODO: Figure out why word count is not updating in   
/// tweets despite saving successfully in file
///
/// TODO: Document code, convert this section into readme.md
/// /// Include algorithm in documentation
/// /// Methodology used to deconstruct/reconstruct acb's PB script
///
/// TODO: figure out why word count is wrong when tweeting code is called in a 
/// function. ideally randomTweet(in_reply_to_id) method which takes in an ID 
/// to tweet at. this is a problem with asynchronous calls
///
/// TODO: Fix 'candid title' so that words like "of" are not capitalized
/// // more faithfully port acb's capitalization rules
///
/// TODO: consider tweeting #nanoGenMo if currentMonth() == November
///
/// TODO: Figure out why sometimes the titles have repetitive terms
/// // i.e., The reality of futility: Batailleist 'powerful communication', 
/// // cultural narrative and Batailleist 'powerful communication'
/// // i.e., De Selby, M.X. 2012. "The Reality Of Paradigm: Predeconstructivist 
/// // narrative, predeconstructivist rationalism and predeconstructivist 
/// // narrative." Stanford University Future Studies Quarterly vol. 22, 
/// // no. 9: pp.71-96
///
/// TODO: may want to return to randomArtMovement() type methods and define 
/// arrays locally. algorithm is weird because it is reverse engineered from 
/// acb's pb script. Refactor so that it is not so messy
///
/// TODO: More topics, universities and disciplines 
/// needed to approach SCIgen similarity
///
/// TODO: Use regex to teach yourself regular expressions
///
//////////////////////////////////////////////////////////////////////////////*/

/*//////////////////////////////////////////////////////////////////////////////

Works Cited:

(01) https://github.com/orenmazor/Dada-Engine/blob/master/scripts/pomo.pb
(02) LastName, F. (2015). Interplay: neo-geo neoconceptual art of the 1980s. 
                Choice Reviews Online, 52(09), pp.52-4572-52-4572.
(03) Adam, E. (2017). Intersectional Coalitions: The Paradoxes of Rights-Based 
                Movement Building in LGBTQ and Immigrant Communities. Law & 
                Society Review, 51(1), pp.132-167.
(04) lastname, f. (year). article title. journal name, randNum(randNum), 
                pp.randNum-randNum.
(05) Muspratt, M. and Steeves, H. (2012). Rejecting Erasure Tropes of Africa: 
                The Amazing Race, Episodes in Ghana Counter Postcolonial 
                Critiques. Communication, Culture & Critique, 5(4), pp.533-540.
(06) http://irsc.libguides.com/mla/workscitedlist
(07) http://hypatiaphilosophy.org/for-contributors/manuscript-
                preparation-guidelines/
(08) McDonald, CeCe. 2017. "Go beyond our natural selves": The prison letters 
                of CeCe McDonald. Transgender Studies Quarterly 4 (2): 243–65.
(09) Rampley, Matthew. "Truth, Interpretation and the Dialectic of Nihilism." 
                Nietzsche, Aesthetics and Modernity, 3rd ser., 1, no. 2 (Spring 
                1999): 13-49. Accessed November 18, 2018. 
                doi:10.1017/cbo9780511663680.002
(10) https://georgiasouthern.libguides.com/c.php?g=834918&p=5961587
(11) https://en.wikipedia.org/wiki/List_of_unaccredited_institutions_of_
                higher_education
(12) https://areomagazine.com/2018/10/02/academic-grievance-studies-and-the-
                corruption-of-scholarship/

//////////////////////////////////////////////////////////////////////////////*/

/*//////////////////////////////////////////////////////////////////////////////
///
/// Local Parameters
///
//////////////////////////////////////////////////////////////////////////////*/

// authenticate to Twitter
var Twitter = require('twitter');
var config = require('./config.js');
var t = new Twitter(config);

// Not sure this is the best implementation 
// for pulling the current working directory.
// Working with local files, need PWD as string
var pwd = require('./pwd.js'); 

// TODO: replace all instances of pwd above with path below
// https://discuss.atom.io/t/sqlite-cantopen-unable-to-open-database-file/26886/2
const path = require('path');
const dbPath = path.resolve(__dirname, 'screen_names.db');

// Other dependencies
// // Fs used for writing files
// // XMLHttpRequest for reading
// // momentJS for parsing Twitter date
// // sqlite3 for storing Twitter users
// // // in local database screen_names.db
const fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const moment = require('moment');
const sqlite3 = require('sqlite3').verbose();
var randomBytes = require('randombytes');

// whether or not to execute the tweet is
// based on how long ago we tweeted the user
var tweetAt = false;

// true if user returned from twitter query is found in database
// false otherwise. if user is not found we tweet at them.
// if found we may not, to reduce spamminess.
var userFound = false;

// Final article title 
var _randomTitle = "";

// any errors thrown are used in the title
var errorMessage = "";

// Volume and issue numbers, 
// derived from the indices
// used to look up random values
// in word bank arrays
var volumeNumber;
var issueNumber;

// Running count of total words ever generated by the bot
// Gotta get to 50K in the month of november to win #NanoGenMo
// Stored in local file /word.total and referenced in main.js
// as totalWords when the file is opened by XMLHttpRequest.open()
// Updated after tweet posted and written back into /word.total
// by fs.writeFile()
var totalWords; 

/*//////////////////////////////////////////////////////////////////////////////
///
/// Title Generation Parameters
///
//////////////////////////////////////////////////////////////////////////////*/

// get external data produced by scraper.js
var data = require("./data");

// set of prefixes to use in ideology 
// and art movement constructionisms
// example: postcapitalism, neocapitalism, etc.
var prefixes = data.prefixes; 

// get data about perfix hyphenization
var metaPrefix = data.metaPrefix;

// set of base ideologies and movements from 
// which to create terms such as "semiotic modernism"
var ideologies = data.ideologies;
var artMovements = data.artMovements;

// set of combination ideology prefixes, i.e. "marxism-leninism-"
var combIdeologies = data.combIdeologies;

// array of adjectives
// selected at random to modify
// ideologies or art movements
var adjectivesThree = data.adjectives;

// array of writers and philosophers
// used as keys when querying the "concepts" object
// i.e., "concepts" object has parameter "Marx"
// with array ["capitalism","socialism","class"]
// one of which is retrieved randomly from 
// the function makeConcept(intellectual) which
// accepts the "intellectual" as an arg
var intellectuals = ["Lacan" , "Derrida" , "Baudrillard" , "Sartre" , 
"Foucault" , "Marx" , "Debord" , "Bataille" , "Lyotard" , "Sontag"];

// concepts object containing an array of terms
// associated to each intellectual key
var concepts = {
/*
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
*/
};

// array of writers and artists
// used in the title, i.e., "capitalism in the works of gibson."
// "citable" vs "uncitable" artists is a holdover from acb's original script,
// which generated an entire paper including citations to "citable" artists.
// for the present purposes this could simply be an array of artists
// but randomartist() and other calls to citableartist will have to be fixed
var citableArtists = [ "Burroughs" , "Joyce" , "Gibson" , "Stone" , "Pynchon" ,
"Spelling" , "Tarantino" , "Madonna", "Rushdie" , "Eco" ];
var uncitableArtists = [ "Koons" , "Mapplethorpe" , "Glass" , "Lynch" , 
"Fellini" , "Cage" , "McLaren" ];

// adjectives and nouns for concrete objects
// used in the generation of the "candid title",
// i.e., "The Forgotten key: Derridaist reading and dialectic Marxism"
var concreteAdjectives = ["vermillion" , "circular" , "broken" , "forgotten",
"stone"	, "iron" , "burning"];
var concreteNouns = ["door" , "fruit" , "key" , "sky" , "sea" , "house"];

// array of gerunds for use in creating the "candid title"
// doingSomethingTos only contains gerunds for concrete nouns
// doingSomethingToMovements only contains gerunds that can be
// applied to art movements or artists/intellectuals
var doingSomethingTos = ["reading" , "deconstructing" , "forgetting"];
var doingSomethingToMovements = ["reinventing" , "deconstructing", 
"reassessing"];

// larger words that can be used in 
// the creation of titles and subtitles
var bigNebulousThings = ["reality" , "discourse" , "consensus" , "expression" , 
                         "narrative" , "context" ];
var somethingOfTwos = ["failure" , "futility" , "collapse" , "fatal flaw" , 
                       "rubicon" , "stasis" , "meaninglessness" , "absurdity" , 
                       "paradigm", "genre" , "defining characteristic" , 
                       "dialectic" , "economy" ];
var bigAbstThings = ["culture" , "language" , "art" , "reality" , "truth" , 
                     "sexuality" , "narrativity" , "consciousness"];

// word arrays from which random indices 
// are drawn in the randomTitle() methods
var adjectivesTwo = [ "capitalist" , randomArrayIndex(adjectivesThree) , 
                      trimE(randomArrayIndex(adjectivesThree)) + "ist", "cultural" , 
                      "dialectic" , "textual" , 
					  /* added by zacfinger: */ trimIsm(randomArrayIndex(ideologies)) + "ist" ,
												trimIsm(randomArrayIndex(artMovements)) + "ist" ];
var adjectives = [ randomArrayIndex(adjectivesTwo) , prefixAndTerm(randomArrayIndex(prefixes), randomArrayIndex(adjectivesTwo)) 
				/* randomArrayIndex(prefixes) + randomArrayIndex(adjectivesTwo) */ ];
var abstNounsTwo = [ "sublimation", trimE(randomArrayIndex(adjectivesThree)) + 
                     "ism" , "construction",	"appropriation", "materialism",	
                     "situationism", 
					 /* added by zacfinger: */ randomArrayIndex(ideologies), randomArrayIndex(artMovements)];
var abstNouns = [ randomArrayIndex(abstNounsTwo) , "theory" , "discourse" ,
                  "narrative" , prefixAndTerm("de", randomArrayIndex(abstNounsTwo))];
var bigThings = ["society" , "class" , randomArrayIndex(bigAbstThings) , 
                 "sexual identity" ];
var candidTitles = [ randomArrayIndex(doingSomethingTos) + " " + randomArrayIndex(intellectuals),
					randomArrayIndex(adjectives) + " " + pluralise(randomArrayIndex(abstNouns)),
					"The " + randomArrayIndex(concreteAdjectives) + " " + randomArrayIndex(concreteNouns),
					"The " + randomArrayIndex(somethingOfTwos) + " of " + randomArrayIndex(bigNebulousThings),
					"The " + randomArrayIndex(somethingOfTwos) + " of " + randomArrayIndex(bigThings),
					"The " + randomArrayIndex(bigNebulousThings) + " of " + randomArrayIndex(somethingOfTwos),
					pluralise(randomArrayIndex(bigNebulousThings)) + " of " + randomArrayIndex(somethingOfTwos),
					randomArrayIndex(doingSomethingToMovements) + " " + randomArrayIndex(artMovements)

];

/*//////////////////////////////////////////////////////////////////////////////
///
/// Author Generation
///
//////////////////////////////////////////////////////////////////////////////*/

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

/*//////////////////////////////////////////////////////////////////////////////
///
/// Publication Generation
///
//////////////////////////////////////////////////////////////////////////////*/

// institutions from whence authors come; biased towards computer-science-type
// institutions ;-)
var universityOf = [ "California" , "Illinois" , "Georgia" , "Massachusetts",
					 "Michigan" , "North Carolina" , "Oregon" 
					 /*,"Arizona" , "The New Sioux Nation"*/ ];

var somethingUniversity = [ "Oxford", "Harvard", "Cambridge", "Yale"
/*, "Portland State", "Trump"*/ ];

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

/*//////////////////////////////////////////////////////////////////////////////
///
/// Methods
///
//////////////////////////////////////////////////////////////////////////////*/

// theoretically improved randomization function
// returns random number between 0...1
function randomPlusPlus(){
	return (parseInt(randomBytes(2).toString('hex'), 16) / (256*256));
}

// array shuffle function for additional randomness
// Ref: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
	var currentIndex = array.length,  randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(randomPlusPlus() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
		array[randomIndex], array[currentIndex]];
	}
}

// for an array arr returns a random element from arr
// embedded in a try/catch on the off chance 
// one of the article titles will have an exception in it
function randomArrayIndex(arr){
	
	try{

		shuffle(arr);

		var rand = randomPlusPlus();

		var index = Math.floor(rand * arr.length);

		volumeNumber = index * 2;

		return arr[index];

	} catch (err){
		errorMessage += err.message;
		return err.message;
	}
}

function twoAdjectives(){
	var adj1 = randomArrayIndex(adjectives);
	var adj2 = adj1;

	// find better way to check if a string contains
	// any words in another string
	while(adj2.startsWith(adj1)){
		adj2 = randomArrayIndex(adjectives);
	}

	return adj1 + " " + adj2;
}

// Capitalize first letter of every word in some string 'str'
// returns a string
function titleCase(str) {
   var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       // Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
   }
   // Directly return the joined string
   return splitStr.join(' '); 
}

// turns string "str" with value "deconstructive" into "deconstrucitiv"
// returns a string 
function trimE (str){
	// consider making this a regular expression
	if(str[str.length-1] == "e"){
		return str.substring(0,str.length-1);
	}
	// handle strings such as "individualist" --> "individual"
	else if (str.slice(-3) == "ist"){
		return str.substring(0, str.length-3);
	}
	// handle strings such as "insurrectionary" --> "insurruection"
	else if (str.slice(-3) == "ary"){
		return str.substring(0, str.length-3);
	}
	return str;
}

// removes "The" and "the" from the beginning of any string str
function stripThe(str){
	if(str.substring(0,4).toLowerCase() == "the ")
		return str.substring(4,str.length-1);
	return str;
}

//given input argument intellectual
//queries "concept" object
//returns a random concept associated with an intellectual
function makeConcept(intellectual){
	if(concepts.hasOwnProperty(intellectual))
		return randomArrayIndex(concepts[intellectual]);

	var str = randomArrayIndex(adjectivesThree) + " ";

	var term = randomArrayIndex([randomArrayIndex(ideologies),randomArrayIndex(artMovements)]);

	if(randomPlusPlus() >= 0.5){
		str += prefixAndTerm(randomArrayIndex(prefixes), term);
	}
	else {
		str += term;
	}

	return str;

}

// returns a pluralised copy of input string "str"
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

function randomIsm() {

	var rand = randomPlusPlus();

	var str = "";

	var chances = 3/8;

	if (rand < chances) {

		if(rand <= (chances * chances)){
			str += randomArrayIndex([randomArrayIndex(artMovements),randomArrayIndex(ideologies)]);
		}
		else {
			str += randomArrayIndex(combIdeologies);
		}
		str += "–";
	}

	return str;
}

function isVowel(c) {

	c = c.toLowerCase();

	return (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u' || c == 'y');
}

// replace all prefix + term with this function
// accounts for hyphens more intelligently
// if using an object with keys doesnt work
// use if first char of term is vowel/consonant
function prefixAndTerm(prefix, term) {

	// default value to use hyphens or not
	var hasHyphen = false;

	if(prefix == "" || prefix == "undefined"){
		prefix = randomArrayIndex(prefixes);
	}
	if(term == "" || term == "undefined"){
		term = randomArrayIndex([randomArrayIndex(artMovements),randomArrayIndex(ideologies)]);
	}

	// Allow for combination prefixes for antidisestablishmentarianism
	// And "antidisestablishmentarianist"
	if(term.toLowerCase().indexOf("establishmentarianis") == 0){

		if(randomPlusPlus() < 0.5){
			return randomArrayIndex(prefixes) + "-" + prefix + "-" + term;
		}
		else {
			return prefix + "-" + randomArrayIndex(prefixes) + "-" + term;
		}

	}

	var c1 = term.toLowerCase().charAt(0);
	var c2 = prefix.toLowerCase().slice(-1);

	str = prefix;

	var sum = 0;

	if(metaPrefix.hasOwnProperty(prefix)){

		var hyphen = metaPrefix[prefix];

		if(hyphen.hasOwnProperty(c1)){
			
			sum = hyphen[c1];
		}
		else {
			for(const [key, value] of Object.entries(hyphen)){

				if(isVowel(c1) && isVowel(c2)){

					if(isVowel(key)){
						sum += value;
					}

				}
				else {
					sum += value;
				}
			}

		}
	}

	if(sum == 0){

		if(isVowel(c1))
		{
			if(isVowel(c2))
			{
				sum = 1;
			}
			
		}
		// prefix is something like "left-"
		else 
		{
			sum = -1;
		}

		console.log("called edge case for prefixes")
	}

	hasHyphen = hasHyphen || sum > 0;

	if(hasHyphen) {
		str += "-" + term;
	}
	else {
		str += term.toLowerCase();
	}

	return str;
}

// Generates the random article title from randomTitleTwo()
// About half of all generated output will prepend a "Candid Title"
function randomTitle(){

	if(errorMessage.length > 0){
		_randomTitle = errorMessage;
	}
	else {
		_randomTitle = detectUndefined(capitalizeFirstLetter(randomTitleTwo()));
	}

	if(randomPlusPlus() > 0.5){

		_randomTitle = detectUndefined(capitalizeFirstLetter(
		titleCase(randomCandidTitle()) + ": " + capitalizeFirstLetter(_randomTitle)));
	}

	return _randomTitle; 

}

// Randomly generates what will either be the full title of the article
// Or the subtitle after a candid title is generated in randomTitle()
// 3/7 of all output is in the format "[vsubject] in the works of [random 
// artist]" where [vsubject] will be a newly constructed term via
// the newTerm() method such as 'predeconstructivist rationalism'
function randomTitleTwo(){

	var rand = randomPlusPlus();
	
	issueNumber = Math.floor(rand * 10);

	var str = "";

	if(rand > 6/7) {
		str += newTerm() + " in the works of " + randomArrayIndex(citableArtists);
	}
	else if(rand > 5/7) {
		str += newTerm() + " in the works of " + randomArtist();
	}
	else if(rand > 4/7) {
		str += newTerm() + " in the works of " + randomArrayIndex(citableArtists);
	}
	else if(rand > 3/7) {
		str += twoTermTitle(newTerm(), newTerm());
	}
	else if(rand > 2/7) {
		str += twoTermTitle(randomIsm() + randomArrayIndex(ideologies), newTerm());
	}
	else if(rand > 1/7) {
		str += twoTermTitle(randomIsm() + randomArrayIndex(artMovements), newTerm());
	}
	else {
		str += threeTermTitle(randomIsm() + randomArrayIndex(artMovements), randomIsm() + randomArrayIndex(ideologies), newTerm());
	}

	return str;

}

function twoTermTitle(foo,bar){
	if(randomPlusPlus() >= 0.5){
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
	if(randomPlusPlus() >= 0.5){
		return randomArrayIndex(citableArtists);
	}

	return randomArrayIndex(uncitableArtists);
}

function termAboutIntellectual(intellectual){
  var str = "";

  if(intellectual == "Foucault"){
    str = "Foucauldian";
  }
	else {
    str = intellectual + "ist"; 
  }
  return str + " " + makeConcept(intellectual);
}

function newTerm(){

	var rand = randomPlusPlus();
	var str = "";

	if(rand > 5/6) {
		str += termAboutIntellectual(randomArrayIndex(intellectuals));
	}
	else if(rand > 3/6) {
		str += randomArrayIndex(adjectives) + " " + randomArrayIndex(abstNouns);
	}
	else if(rand > 2/6) {
		str += twoAdjectives() + " theory";
	}
	else if(rand > 1/6) {
		str += "the " + randomArrayIndex(adjectives) + " paradigm of " + randomArrayIndex(bigNebulousThings);
	}
	else {
		str += randomArrayIndex(adjectives) + " " + randomArrayIndex(ideologies);
	}

	return str;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function trimIsm(str) {
	if (str.slice(-3) == "ism"){
		return str.substring(0, str.length-3);
	}
	return str;
}

// this doesnt really work right now
function detectUndefined(str){
	var words = str.split(" ");
	var newStr = "";
	for(var x=0;x<words.length;x++){
		var temp = words[x];

		if(words[x].toLowerCase() == "undefined"){
			console.log("undefined found");
			
			var term = trimIsm(randomArrayIndex([randomArrayIndex(artMovements), randomArrayIndex(ideologies)])) + "ist";
			
			if(randomPlusPlus() >= 0.5){
				temp = prefixAndTerm(randomArrayIndex(prefixes), term);
			}
			else {
				temp = term;
			}
		}

		newStr += temp;

		if(x+1 < words.length)
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

if(process.argv[2]!=null || true){
  // if process.argv[2] is null do not:
  // open sql database
  // write to sqlite database
  // write to since.id
  // write to word.total
  // only display constructed message

  // using process.argv[2] == null ensures previous
  // deployments will continue to function
  
  	console.log("\n");
	//console.log(prefixAndTerm(randomArrayIndex(prefixes), "establishmentarianism"))
	console.log(randomTitle());
  	console.log("\n");
}
else 
{

  ///////// USE TWITTER API

  // global since_id parameter stored in file "since.id"
  // use t.get() to query twitter for keyword citationneeded
  // if since ID file is empty
  // twitter still prcoesses the query

  // if json response is not empty
  // take id of first post in the json
  // and the screen name of the first post in the json

  // overwrite the file "since.id" with the id of the first post in the JSON

  // get the value of file "word.total"

  // generate the post:
  // // // @[screen_name]: [random name]. ([random year]) "[random title]." 
  // // // [random publication] vol.[randon number], no. [random number]: pp.
  // // // [total word count before this post]-[total word count after this post]
  // // // [link to google scholar query for keywords in the article title]

  // update totalWords with the word count of the tweet
  // overwrite the file "word.total" with new value of totalWords

  // post the tweet to Twitter API

  // get the most recent ID we tweeted
  var since_id = readTextFile("file://"+pwd+"since.id");

  // query Twitter for relevant posts made after since_id
  var tweetGet = t.get('search/tweets',{"q": "citationneeded", 
                                        "since_id": since_id});

  tweetGet.then(function(value){

  	console.log(value);

  	if(value["statuses"][0]!=undefined){
  		
  		// get ID of first post in the JSON
  		var in_reply_to_status_id = value["statuses"][0].id_str;

  		// get screen name of first post in the JSON
  		var screen_name = value["statuses"][0]["user"].screen_name;

  		// convert Twitter timestamp to UNIX time via momentJS
  		var timeStamp = moment(value["statuses"][0]["created_at"], 
  						"ddd MMM DD HH:mm:ss Z YYYY", "en").unix();

  		// open database in memory
  		let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  		  if (err) {
  		  	errorMessage += err.message;
  		    console.error(err.message);
  		  }
  		  console.log('Connected to the database.');
  		});

  		// look for screen name in db
  		db.all(`SELECT * FROM screen_names`, (err, row) => {
  		  if(err){
  		  	errorMessage += err.message;
  		    return console.error(err.message);
  		  }

  		  for(var x=0;x<row.length;x++){
  		  	if(row[x]["user"] == screen_name){
  		  		// if user matches
  		  		// (meaning we have tweeted at them before)
  		  		userFound = true;

  		  		// check time stamp
  		  		if((timeStamp - row[x]["timestamp"]) >= (72*60*60)){

  		  			// if time stamp is older than 72 h ago
  		  			// update timestamp in db
  		  			// else it is too soon to tweet this user
  		  			db.run(`UPDATE screen_names SET timestamp = ? WHERE user = ?`, [timeStamp, screen_name], function(err) {
  			          if (err) {
  			            errorMessage += err.message;
  		    			return console.error(err.message);
  			          }
  			          console.log("Row(s) updated: " + screen_name);
  			           
  			        });
  			        // and tweet at them
  			        tweetAt = true;
  			        
  		  		} else { console.log("too soon to tweet at " + screen_name);}
  		  		x = row.length + 1;
  		  		// break out if user found
  		  	}
  		  }

  		  if(!userFound){
  		  		// if user is not found
  		      	// new screen name
  		      	// we have never tweeted to them before
  		        
  		      	// enter them into db
  		      	db.run(`INSERT INTO screen_names (user, timestamp) VALUES(?, ?)`, [screen_name,timeStamp], function(err) {
  		        	if (err) {
  		        		errorMessage += err.message;
  		    			return console.log(err.message);
  		        	}
  		        	// get the last insert id
  		        	//console.log(`A row has been inserted with rowid ${this.lastID}`);
  		      });

  		      // and tweet at them
  		      tweetAt = true;
  		  }

  		  if(tweetAt){
  		    // black list maintained before the sqlite3 implementation
  		    // users once stored here are now stored in the sqlite3 database
  		    // may consider loading from file instead if needed again
  			/*if(screen_name != "user1" &&
  			   screen_name != "user2" &&
  			   screen_name != "user3"){*/

  				totalWords = readTextFile("file://"+pwd+"word.total");

  				var message = "@" + screen_name + ": " + randomName() + " (" + randomYear() + ") \"" 
  							+ randomTitle() + ".\" " + randomPublication() + " vol. " 
  							+ (volumeNumber + 2) + ", no. " + (issueNumber + 1) + ": pp." + totalWords + "-";

  				totalWords = Number(totalWords) + message.split(" ").length - 1;

  				fs.writeFile(pwd+"word.total", totalWords, function(err) { 
  					if(err) { console.log(err.message); }
  				});

  				message += totalWords + ". " + makeGoogleScholarURL(_randomTitle)/* + " #citationneeded"*/;

  				console.log(message);

  				t.post('statuses/update',{"status": message, "in_reply_to_status_id": in_reply_to_status_id,
  				"auto_populate_reply_metadata": true}, function(req, res) {
  				        //console.log(res);

  				        
  				});

  				// overwrite value of file "since.id"
  				// with ID of post we tweeted at
  				fs.writeFile(pwd+"since.id", in_reply_to_status_id, function(err) { 
  					if(err) { console.log(err.message); }
  				});
  			//}
  		  }
  		  
  		});

  		// close the database connection
  		db.close((err) => {
  		  if (err) {

  		    return console.error(err.message);
  		  }
  		  console.log('Close the database connection.');
  		});

  	} else {
  		console.log("no recent tweets matching query");
  	}

  });
}

