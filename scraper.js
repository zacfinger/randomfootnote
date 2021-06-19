/*//////////////////////////////////////////////////////////////////////////////
///
/// TO DO:
/// 
/// TODO: Maintain each string in array as lower-case. Determine if 
/// capitalization is necessary by maintaining count of times term is 
/// capitalized or not, and favoring one or the other in the end. This ensures
/// proper nouns are always capitalized if they are in the source content.
///
/// TODO: For every adjective entered, if first word not part of speech = 
/// proper noun, make lower-case.
///
/// TODO: Always put hyphens if term is capitalized i.e., pre-Raphaelitism
///
/// TODO: Need to modularize and break into functions
///
//////////////////////////////////////////////////////////////////////////////*/

const artMovementUrl = "https://en.wikipedia.org/wiki/List_of_art_movements";
const ideologyUrl = "https://en.wikipedia.org/wiki/List_of_political_ideologies";
const academicFieldUrl = "https://en.wikipedia.org/wiki/List_of_academic_fields";
const axios = require("axios");
const cheerio = require("cheerio");
var pos = require("pos");
var thesaurus = require("thesaurus");
const fs = require('fs');

const fetchData = async (siteUrl) => {
  const result = await axios.get(siteUrl);
  return cheerio.load(result.data);
};

var artMovements = 
// from acb's original pb script:
[ "surrealism" , "modernism" , "realism" , 
"constructivism" , "expressionism" ];

var ideologies = 
// from acb's original pb script:
[ "capitalism" , "Marxism" , "socialism" , "feminism" , "libertarianism" , 
"objectivism" , "rationalism" , "nationalism" , "nihilism" ];

var prefixes =
// from acb's original pb script:
[ "post","neo","sub","pre" ];

var adjectives = 
// from acb's original pb script:
[ "structural" , "semiotic" , "modern" , "constructive" ,
"semantic" , "deconstructive" , "patriarchial" , "conceptual" , "material" , 
// implied from acb's art movements
"social" , "socialist" ];

var combIdeologies = [];

var metaPrefix = {};

////////////////////////////////////////////////////////////////////////////////

function rootWordInDictionary(someWord) {

    // remove "-ism" from end 
    var index = someWord.indexOf("ism");
    var prefix = someWord.substring(0, index);
    
    // if word is in dictionary
    return inDictionary(prefix);
}

function inDictionary(someWord) {
    return thesaurus.find(someWord).length > 0;

}

const getIdeologies = async() => {

    var movementsToRemove = [];

    const $ = await fetchData(ideologyUrl);

    $(".mw-parser-output li").each((index, element) => {

        // get ideology as array of strings separated by \n
        var ideologyLines = $(element).text().trim().split("\n");
        
        ideologyLines.forEach(line => {

            // Filter out sentences, possessive and section headings
            // TODO: Needs improvement...could miss some ideologies
            // TODO: Use POS to find possessive nouns 
            if(line.indexOf(".") < 0 && line.indexOf("'") < 0 
                && line.indexOf(":") < 0 && /\d/.test(line) == false
                && line.indexOf("/") < 0 && line.indexOf("(") < 0
                && line != "Social democracyDemocratic socialismSocialismSyndicalism"
            )
            {
                // get ideology as array of strings
                var ideologyWords = line.trim().split(" ");

                // get last word in array
                // TODO: Account for proper nouns, i.e. "Marxism"
                // // Use "list of ideologies named after people"
                var lastWord = ideologyWords[ideologyWords.length - 1].toLowerCase();

                if (lastWord.slice(-3) == "ism"){

                    // check for two word ideologies, i.e. "De Leonism"
                    if(ideologyWords.length > 1){
                        if(
                            (lastWord.toLowerCase() == "leonism" && ideologyWords[ideologyWords.length - 2].toLowerCase().endsWith("de"))
                         || (lastWord.toLowerCase() == "worldism" && ideologyWords[ideologyWords.length - 2].toLowerCase().endsWith("third"))
                         || (lastWord.toLowerCase() == "positionism" && ideologyWords[ideologyWords.length - 2].toLowerCase().endsWith("third"))
                        ){
                            ideologyWords[ideologyWords.length - 2] = ideologyWords[ideologyWords.length - 2].toLowerCase() + " " + lastWord.toLowerCase();

                            lastWord = ideologyWords[ideologyWords.length - 2];

                            ideologyWords.pop();
                        }
                    }

                    // account for ideology "saint-simonianism"
                    // TODO: what will happen if ideology == "post-saint-simonianism"
                    if(lastWord.toLowerCase() != "saint-simonianism" 
                        && lastWord.toLowerCase() != "third-worldism" 
                        && lastWord.toLowerCase() != "one-nationism"
                    ){
                        // split by hyphen if one exists
                        // TODO: Sometimes hyphen is needed "Post-impressionism" vs "Postmodernism"
                        // For example "Cubo-Futurism", observe frequency of word using hyphens
                        // Or whether char after hyphen is vowel vs consonant
                        var index = lastWord.lastIndexOf("-");

                        // account for non-standard hyphenization
                        if(index < 0){
                            index = lastWord.lastIndexOf("–")
                        }

                        // if a hyphenated prefix exists
                        if(index > -1){
                            var prefix = lastWord.substring(0, index);
                            lastWord = lastWord.substring(index + 1);

                            if(prefix.slice(-3) == "ism") {
                                if(!combIdeologies.includes(prefix)){
                                    combIdeologies.push(prefix);
                                } 
                            } else {
                                if(!prefixes.includes(prefix)) {
                                    // add to array of prefixes
                                    prefixes.push(prefix);
                                }

                                if(!movementsToRemove.includes(ideologyWords[ideologyWords.length - 1].toLowerCase()))
                                {

                                    var c = lastWord.charAt(0);

                                    if(!metaPrefix.hasOwnProperty(prefix)){
                                        metaPrefix[prefix] = {};
                                    }
                                    if(!metaPrefix[prefix].hasOwnProperty(c)){
                                        metaPrefix[prefix][c] = 1;
                                    }
                                    else if(metaPrefix[prefix].hasOwnProperty(c)){
                                        metaPrefix[prefix][c] += 1;
                                    }

                                    movementsToRemove.push(ideologyWords[ideologyWords.length - 1].toLowerCase());
                                }
                            }
                        }
                    }

                    // add movement to list
                    if(!ideologies.includes(lastWord)) {
                        ideologies.push(lastWord);
                    }

                    // To preserve words like "social democratic ___ism"
                    // Every single word in front of the final word is considered a single adjective
                    if(ideologyWords.length > 1)
                    {
                        var index = -1;

                        // filter out words like "of" and "against"
                        for(var i = ideologyWords.length - 1; i >= 0; i--){
                            var word = ideologyWords[i];
                            var tagger = new pos.Tagger();
                            var tags = tagger.tag([word]);
                            if(tags[0][1] == 'CC' || tags[0][1] == 'DT' || tags[0][1] == 'IN' || tags[0][1] == "TO" || tags[0][1] == "VB"){
                                index = i;
                                //exit for
                                break;
                            }
                        }

                        var word = ideologyWords.slice(index + 1, ideologyWords.length - 1).toString().replace(/[,]+/g, " ").trim();
                        
                        if(!adjectives.includes(word) && word != "" && word != "class struggleunder"){
                            adjectives.push(word);
                        }
                    }                
                }
            }
        });
    });

    ideologies.sort();
    prefixes.sort();

    var ideologyLen = 0;
    var prefixLen = 0;

    console.log(metaPrefix);

    // While loop runs until no more prefixes/movements found
    while(ideologyLen != ideologies.length && prefixLen != prefixes.length) {

        ideologyLen = ideologies.length;
        prefixLen = prefixes.length;

        // extract prefixes from derivative movements
        // i.e., humanism --> transhumanism yields "trans-"
        // TODO: Ideologies without a base 
        // such as "multiculturalism" and "pluriculturalism"
        // there is no "culturalism" but there is "multi"
        ideologies.forEach(movement => {

            ideologies.forEach(otherMovement => {
                // if this is a derivative of another movement
                // i.e., "transhumanism" ends with "humanism"
                if(otherMovement != movement
                    && otherMovement.endsWith(movement)
                    // TODO: this isn't really the best way to do this
                    && movement.toLowerCase() != "anationalism"         // created prefix "ultr-"
                    && otherMovement.toLowerCase() != "veganarchism"    // created prefix "veg-"
                    && otherMovement.toLowerCase() != "panarchism"      // created movement "archism"
                    && otherMovement.toLowerCase() != "eurasianism"     // created prefix "eur-"
                    && otherMovement.toLowerCase() != "impossibilism"   // created prefix "im-"
                    && otherMovement.toLowerCase() != "intactivism"     // created prefix "int-"
                    && otherMovement.toLowerCase() != "confederalism"   // created prefix "con-"
                    && otherMovement.toLowerCase() != "eliminationism"  // created prefix "elimi"
                ){
                    // extract prefix
                    index = otherMovement.indexOf(movement);
                    prefix = otherMovement.substring(0, index);

                    // add prefix to array
                    if(!prefixes.includes(prefix) && prefix != "antidis"){
                        prefixes.push(prefix);
                    }

                    if(!movementsToRemove.includes(otherMovement) && prefix != "antidis"){
                        var c = movement.charAt(0);
    
                        if(!metaPrefix.hasOwnProperty(prefix)){
                            metaPrefix[prefix] = {};
                        }
                        if(!metaPrefix[prefix].hasOwnProperty(c)){
                            metaPrefix[prefix][c] = -1;
                        }
                        else if(metaPrefix[prefix].hasOwnProperty(c)){

                            metaPrefix[prefix][c] -= 1;
                        }
                    }

                    // track movements to remove
                    if(!movementsToRemove.includes(otherMovement)){
                        movementsToRemove.push(otherMovement);
                    }
                }
            })
        });

        console.log(movementsToRemove);

        // remove movements whose prefix and root are saved
        ideologies = ideologies.filter(e => !movementsToRemove.includes(e));

        movementsToRemove = [];

        // extract prefixes which did not have prefix with hyphen
        // iterate through each movement
        ideologies.forEach(movement => { 

            // if movement starts with one of the found prefixes
            prefixes.forEach(prefix => {
                if(movement.startsWith(prefix)){
                    // find string after prefix
                    var rootMovement = movement.substring(prefix.length);

                    // TODO: should find a better way for these edge cases
                    // TODO: Scrape wikipedia for the title and see if 404
                    if(inDictionary(rootMovement) 
                        && rootMovement.toLowerCase() != "ism"
                        && rootMovement.toLowerCase() != "sm"
                        || rootMovement.toLowerCase() == "nomism"
                        || rootMovement.toLowerCase() == "montanism"
                        || rootMovement.toLowerCase() == "gaianism"
                        || rootMovement.toLowerCase() == "culturalism"
                    ){
                        if(!ideologies.includes(rootMovement)){
                            ideologies.push(rootMovement);
                        }

                        // otherMovement = "ecoauthoritarianism"
                        // movement = "authoritarianism"
                        if(!movementsToRemove.includes(movement))
                        {
                            var c = rootMovement.charAt(0);

                            if(!metaPrefix.hasOwnProperty(prefix)){
                                metaPrefix[prefix] = {};
                            }
                            if(!metaPrefix[prefix].hasOwnProperty(c)){
                                metaPrefix[prefix][c] = -1;
                            }
                            else if(metaPrefix[prefix].hasOwnProperty(c)){
                                metaPrefix[prefix][c] -= 1;
                            }

                        }

                        // track movements to remove
                        if(!movementsToRemove.includes(movement))
                        {

                            movementsToRemove.push(movement);
                        }
                    }
                }
            });
        });

        console.log(movementsToRemove);

        // remove movements whose prefix and root are saved
        ideologies = ideologies.filter(e => !movementsToRemove.includes(e));

        movementsToRemove = [];
    }
    
    ideologies.sort();

}

const getArtMovements = async() => {

    var movementsToRemove = [];

    const $ = await fetchData(artMovementUrl);
        
    $(".mw-parser-output > ul > li").each((index, element) => {

        // get Art Movement as array of strings
        var movementWords = $(element).text().trim().split(" ");
        
        // get last word in array
        // TODO: Account for proper nouns, i.e. "Pre-Raphaelitism"
        // Possible solution: https://stackoverflow.com/questions/48145432/javascript-includes-case-insensitive/48145521
        var lastWord = movementWords[movementWords.length - 1].toLowerCase();
        
        // if last word is an -ism
        // TODO: include words that may have other characters after "ism"
        // "Neoplasticism"
        // TODO: Include movements that should have an "ism"
        // If movements ends in "modern", i.e., "Altermodern"
        if( lastWord.slice(-3) == "ism" ) {

            // catch non-standard hyphenization
            // TODO: replace with regex
            lastWord = lastWord.replace("–", "-");

            // split by hyphen if one exists
            // TODO: Sometimes hyphen is needed "Post-impressionism" vs "Postmodernism"
            // For example "Cubo-Futurism", observe frequency of word using hyphens
            // Or whether char after hyphen is vowel vs consonant
            var prefixAndMovement = lastWord.split("-");

            // if a hyphenated prefix exists
            if (prefixAndMovement.length > 1) {

                // add to array of prefixes
                var prefix = prefixAndMovement[0];
                lastWord = prefixAndMovement[1];

                if(!prefixes.includes(prefix)) {
                    prefixes.push(prefix);
                }

                if(!movementsToRemove.includes(movementWords[movementWords.length - 1].toLowerCase()))
                {
                    var c = lastWord.charAt(0);

                    if(!metaPrefix.hasOwnProperty(prefix)){
                        metaPrefix[prefix] = {};
                    }
                    if(!metaPrefix[prefix].hasOwnProperty(c)){
                        metaPrefix[prefix][c] = 1;
                    }
                    else if(metaPrefix[prefix].hasOwnProperty(c)){
                        metaPrefix[prefix][c] += 1;
                    }

                    movementsToRemove.push(movementWords[movementWords.length - 1].toLowerCase());
                }
            }

            // add movement to list
            if(!artMovements.includes(lastWord)) {
                artMovements.push(lastWord);
            }

            // To preserve words like "social democratic ___ism"
            // Every single word in front of the final word is considered a single adjective
            if(movementWords.length > 1)
            {
                var word = movementWords.slice(0, movementWords.length - 1).toString().replace(/[,]+/g, " ").trim();
                // TODO: Adjectives that are also movements or ideologies
                // For example, "socialist"
                if(!adjectives.includes(word)){
                    adjectives.push(word);
                }
            }
        }
    });

    var movementLen = 0;
    var prefixLen = 0;

    // While loop runs until no more prefixes/movements found
    while(movementLen != artMovements.length && prefixLen != prefixes.length){
        
        movementLen = artMovements.length;
        prefixLen = prefixes.length;

        // extract prefixes from derivative movements
        // i.e., modernism --> postmodernism yields "post-"
        artMovements.forEach(movement => {

            artMovements.forEach(otherMovement => {
                // if this is a derivative of another movement
                // i.e., "postmodernism" ends with "modernism"
                if(otherMovement != movement 
                    && otherMovement.endsWith(movement)
                    // TODO: doesn't work for massurrealism vs surrealism
                    && otherMovement.toLowerCase() != "massurrealism" // created prefixes "massur-" and "mas-"
                ) {

                    // only extract prefix and movement
                    // if prefix + movement without "ism" is a word in dictionary
                    // this allows for "realism" vs "surrealism"
                    // by checking if root "sur" in dictionary
                    // will fail if root is "surreal"
                    // TODO: must be a better way to do this
                    if(!rootWordInDictionary(otherMovement)) {

                        // extract prefix
                        index = otherMovement.indexOf(movement);
                        prefix = otherMovement.substring(0, index);
                        
                        // add prefix to array
                        if(!prefixes.includes(prefix)){
                            prefixes.push(prefix);
                        }

                        if(!movementsToRemove.includes(otherMovement)){
                            var c = movement.charAt(0);
        
                            if(!metaPrefix.hasOwnProperty(prefix)){
                                metaPrefix[prefix] = {};
                            }
                            if(!metaPrefix[prefix].hasOwnProperty(c)){
                                metaPrefix[prefix][c] = -1;
                            }
                            else if(metaPrefix[prefix].hasOwnProperty(c)){
    
                                metaPrefix[prefix][c] -= 1;
                            }
                        }

                        // track movements to remove
                        if(!movementsToRemove.includes(otherMovement)){
                            
                            movementsToRemove.push(otherMovement);
                        }
                    }
                }
            });
        });

        // extract prefixes which did not have prefix with hyphen
        // iterate through each movement
        artMovements.forEach(movement => { 

            // if movement starts with one of the found prefixes
            prefixes.forEach(prefix => {
                if(movement.startsWith(prefix)
                    && movement.toLowerCase() != "neoism" // creates movement "-ism"
                ){
                    // find string after prefix
                    var rootMovement = movement.substring(prefix.length);

                    if(inDictionary(rootMovement)){

                        if(!artMovements.includes(rootMovement)){
                            artMovements.push(rootMovement);
                        }

                        if(!movementsToRemove.includes(movement))
                        {
                            var c = rootMovement.charAt(0);

                            if(!metaPrefix.hasOwnProperty(prefix)){
                                metaPrefix[prefix] = {};
                            }
                            if(!metaPrefix[prefix].hasOwnProperty(c)){
                                metaPrefix[prefix][c] = -1;
                            }
                            else if(metaPrefix[prefix].hasOwnProperty(c)){
                                metaPrefix[prefix][c] -= 1;
                            }

                        }

                        // track movements to remove
                        if(!movementsToRemove.includes(movement)){
                                
                            movementsToRemove.push(movement);
                        }
                    }
                }
            })
        });
    }

    console.log(movementsToRemove);

    // remove movements whose prefix and root are saved
    artMovements = artMovements.filter(e => !movementsToRemove.includes(e));
    
    artMovements.sort();
    
};

(async () => {

    // TODO: https://en.wikipedia.org/wiki/List_of_philosophies
    // https://en.wikipedia.org/wiki/Philosophical_movement
    // https://en.wikipedia.org/wiki/Category:Philosophical_movements
    // https://en.wikipedia.org/wiki/Category:Marxism
    // https://en.wikipedia.org/wiki/List_of_Christian_denominations
    // https://en.wikipedia.org/wiki/List_of_new_religious_movements
    //
    // https://en.wikipedia.org/wiki/List_of_architectural_styles
    // TODO: Get list of theorists/philosophers
    // https://en.wikipedia.org/w/index.php?search=List+of+theorists&title=Special%3ASearch&go=Go&ns0=1
    // https://en.wikipedia.org/wiki/List_of_academic_fields

    //await getDepartmentTopics();

    await getArtMovements();
    await getIdeologies();

    prefixes.sort();
    adjectives.sort();

    console.log(ideologies.includes("disestablishmentarianism"));
    console.log(ideologies.includes("establishmentarianism"));
    
    console.log(prefixes);

    console.log(prefixes.length); // 60
    console.log(adjectives.length); // 311
    console.log(artMovements.length); // 42
    console.log(ideologies.length); // 445
    console.log(combIdeologies.length); // 4
    console.log(metaPrefix);

    var insertString = "";

    insertString += "module.exports.artMovements = " + JSON.stringify(artMovements);
    insertString += ";\n";

    insertString += "module.exports.prefixes = " + JSON.stringify(prefixes);
    insertString += ";\n";

    insertString += "module.exports.adjectives = " + JSON.stringify(adjectives);
    insertString += ";\n";

    insertString += "module.exports.ideologies = " + JSON.stringify(ideologies);
    insertString += ";\n";

    insertString += "module.exports.combIdeologies = " + JSON.stringify(combIdeologies);
    insertString += ";\n";

    insertString += "module.exports.metaPrefix = " + JSON.stringify(metaPrefix);
    insertString += ";";

    fs.writeFileSync('data.js', insertString, 'utf-8');
    
})()