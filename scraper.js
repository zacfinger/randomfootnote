/*//////////////////////////////////////////////////////////////////////////////
///
/// TO DO:
///
/// TODO: Determine why prefix hyphenization data differs
///
/// TODO: Extract prefix "non" from art movement "nonconformism" 
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
/// TODO: Get content inside <a> tags
///
/// TODO: Prepare HTML nodes before processing i.e., strip out \n etc
///
/// // TODO: https://en.wikipedia.org/wiki/List_of_philosophies
/// // https://en.wikipedia.org/wiki/Philosophical_movement
/// // https://en.wikipedia.org/wiki/Category:Philosophical_movements
/// // https://en.wikipedia.org/wiki/Category:Marxism
/// // https://en.wikipedia.org/wiki/List_of_Christian_denominations
/// // https://en.wikipedia.org/wiki/List_of_new_religious_movements
/// // 
/// // https://en.wikipedia.org/wiki/List_of_architectural_styles
/// // TODO: Get list of theorists/philosophers
/// // https://en.wikipedia.org/w/index.php?search=List+of+theorists&title=Special%3ASearch&go=Go&ns0=1
/// // https://en.wikipedia.org/wiki/List_of_academic_fields
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

function inDictionary(someWord) {
    return thesaurus.find(someWord).length > 0;

}

function containsCaseInsensitive(arr, term) {

    var contains = false;

    arr.forEach(element => {
        if(term.toLowerCase() == element.toLowerCase()){
            contains = true;
        }
    });

    return contains;
}

function pushLowerCase(arr, term) {

    var index = -1;

    // if term not already present
    if(!arr.includes(term)){

        var termFound = false;

        // assume array contains a differently-cased version of term
        arr.forEach(element => {

            // if a differently-cased version of term is found
            if(term.toLowerCase() == element.toLowerCase()){

                termFound = true;

                // if element is not already lower case
                if(element.toLowerCase() != element){

                    // we will prefer lowercase
                    if(term.toLowerCase() == term){

                        // replace the term
                        var i = arr.indexOf(element);
                        arr[i] = term;
                    }
                }
            }
        });
        
        // add term if not yet encountered
        if(!termFound) {
            arr.push(term);
        }
    }

    return arr;
}

const getIdeologies = async(url, arr) => {

    var movementsToRemove = [];

    const $ = await fetchData(url);

    $(".mw-parser-output li").each((index, element) => {

        // get ideology as array of strings separated by \n
        var ideologyLines = $(element).text().trim().split("\n");
        
        ideologyLines.forEach(line => {

            // Filter out sentences, possessive and section headings
            // TODO: Needs improvement...could miss some ideologies
            // Have to have special cases to account for weird formatting...
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
                // Possible solution: https://stackoverflow.com/questions/48145432/javascript-includes-case-insensitive/48145521
                var lastWord = ideologyWords[ideologyWords.length - 1];

                // if last word is an -ism
                // TODO: include words that may have other characters after "ism"
                // "Neoplasticism)" is on the page in parentheses
                // TODO: Include movements that should have an "ism"
                // If movements ends in "modern", i.e., "Altermodern"
                if (lastWord.toLowerCase().slice(-3) == "ism"){

                    // check for two word ideologies, i.e. "De Leonism"
                    if(ideologyWords.length > 1){
                        if(
                            (lastWord.toLowerCase() == "leonism" && ideologyWords[ideologyWords.length - 2].toLowerCase().endsWith("de"))
                         || (lastWord.toLowerCase() == "worldism" && ideologyWords[ideologyWords.length - 2].toLowerCase().endsWith("third"))
                         || (lastWord.toLowerCase() == "positionism" && ideologyWords[ideologyWords.length - 2].toLowerCase().endsWith("third"))
                        ){
                            ideologyWords[ideologyWords.length - 2] = ideologyWords[ideologyWords.length - 2] + " " + lastWord;

                            lastWord = ideologyWords[ideologyWords.length - 2];

                            ideologyWords.pop();
                        }
                    }

                    // account for hyphentaed ideologies, i.e. "saint-simonianism"
                    // TODO: what will happen if ideology == "post-saint-simonianism"
                    if(lastWord.toLowerCase() != "saint-simonianism" 
                        && lastWord.toLowerCase() != "third-worldism" 
                        && lastWord.toLowerCase() != "one-nationism"
                    ){
                        // split by hyphen if one exists
                        var index = lastWord.lastIndexOf("-");

                        // account for non-standard hyphenization
                        if(index < 0){
                            index = lastWord.lastIndexOf("–")
                        }

                        // if a hyphenated prefix exists
                        if(index > -1){
                            var prefix = lastWord.substring(0, index);
                            lastWord = lastWord.substring(index + 1);

                            // Capture combination ideologies, i.e. "Marxism-Leninism"
                            if(prefix.toLowerCase().slice(-3) == "ism") {
                                if(!combIdeologies.includes(prefix)){
                                    combIdeologies.push(prefix);
                                } 
                            } else {
                                if(containsCaseInsensitive(prefixes, prefix)) {
                                    prefixes = pushLowerCase(prefixes, prefix);
                                }
                                else {
                                    prefixes.push(prefix);
                                }

                                // Capture hyphenation information 
                                if(!movementsToRemove.includes(ideologyWords[ideologyWords.length - 1].toLowerCase()))
                                {

                                    var c = lastWord.toLowerCase().charAt(0);

                                    if(!metaPrefix.hasOwnProperty(prefix.toLowerCase())){
                                        metaPrefix[prefix.toLowerCase()] = {};
                                    }
                                    if(!metaPrefix[prefix.toLowerCase()].hasOwnProperty(c)){
                                        metaPrefix[prefix.toLowerCase()][c] = 1;
                                    }
                                    else if(metaPrefix[prefix.toLowerCase()].hasOwnProperty(c)){
                                        metaPrefix[prefix.toLowerCase()][c] += 1;
                                    }

                                    movementsToRemove.push(ideologyWords[ideologyWords.length - 1].toLowerCase());
                                }
                            }
                        }
                    }

                    // add movement to list
                    if(containsCaseInsensitive(arr, lastWord)) {
                        arr = pushLowerCase(arr, lastWord);
                    }
                    else {
                        arr.push(lastWord);
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
                        // TODO: Adjectives that are also movements or ideologies or have prefixes
                        // For example, "socialist realism" or "post-modern feminism"
                        if(!adjectives.includes(word) && word != "" && word != "class struggleunder"){
                            adjectives.push(word);
                        }
                    }                
                }
            }
        });
    });

    arr.sort();
    prefixes.sort();

    var ideologyLen = 0;
    var prefixLen = 0;

    // While loop runs until no more prefixes/movements found
    while(ideologyLen != arr.length && prefixLen != prefixes.length) {

        ideologyLen = arr.length;
        prefixLen = prefixes.length;

        // extract prefixes from derivative movements
        // i.e., humanism --> transhumanism yields "trans-"
        arr.forEach(movement => {

            arr.forEach(otherMovement => {

                // if this is a derivative of another movement
                // i.e., "postmodernism" ends with "modernism"
                if(otherMovement.toLowerCase() != movement.toLowerCase()
                    && otherMovement.toLowerCase().endsWith(movement.toLowerCase())
                    // TODO: this isn't really the best way to do this
                    && movement.toLowerCase() != "anationalism"         // created prefix "ultr-"
                    && otherMovement.toLowerCase() != "veganarchism"    // created prefix "veg-"
                    && otherMovement.toLowerCase() != "panarchism"      // created movement "archism"
                    && otherMovement.toLowerCase() != "eurasianism"     // created prefix "eur-"
                    && otherMovement.toLowerCase() != "impossibilism"   // created prefix "im-"
                    && otherMovement.toLowerCase() != "intactivism"     // created prefix "int-"
                    && otherMovement.toLowerCase() != "confederalism"   // created prefix "con-"
                    && otherMovement.toLowerCase() != "eliminationism"  // created prefix "elimi"
                    && otherMovement.toLowerCase() != "massurrealism"   // created prefixes "massur-" and "mas-"
                    && otherMovement.toLowerCase() != "surrealism"      // created prefix "sur-"
                ){

                    // extract prefix
                    index = otherMovement.toLowerCase().indexOf(movement.toLowerCase());
                    prefix = otherMovement.substring(0, index);

                    // add prefix to array
                    if(prefix.toLowerCase() != "antidis"){
                        
                        if(containsCaseInsensitive(prefixes, prefix)) {
                            prefixes = pushLowerCase(prefixes, prefix);
                        }
                        else {
                            prefixes.push(prefix);
                        }
                    }

                    if(!movementsToRemove.includes(otherMovement.toLowerCase()) && prefix.toLowerCase() != "antidis"){
                        var c = movement.toLowerCase().charAt(0);
    
                        if(!metaPrefix.hasOwnProperty(prefix.toLowerCase())){
                            metaPrefix[prefix.toLowerCase()] = {};
                        }
                        if(!metaPrefix[prefix.toLowerCase()].hasOwnProperty(c)){
                            metaPrefix[prefix.toLowerCase()][c] = -1;
                        }
                        else if(metaPrefix[prefix.toLowerCase()].hasOwnProperty(c)){

                            metaPrefix[prefix.toLowerCase()][c] -= 1;
                        }
                    }

                    // track movements to remove
                    if(!movementsToRemove.includes(otherMovement.toLowerCase())){
                        
                        movementsToRemove.push(otherMovement.toLowerCase());
                    }
                }
            })
        });

        movementsToRemove.forEach(movement => {
            console.log(movement);
        });

        // remove movements whose prefix and root are saved
        arr = arr.filter(e => !movementsToRemove.includes(e.toLowerCase()));

        movementsToRemove = [];

        // extract prefixes which did not have prefix with hyphen
        // iterate through each movement
        arr.forEach(movement => { 

            // if movement starts with one of the found prefixes
            prefixes.forEach(prefix => {

                if(movement.toLowerCase().startsWith(prefix.toLowerCase())){
                    // find string after prefix
                    var rootMovement = movement.substring(prefix.length);

                    // only extract prefix and movement
                    // if prefix + movement without "ism" is a word in dictionary
                    // this allows for "realism" vs "surrealism"
                    // by checking if root "sur" in dictionary
                    // will fail if root is "surreal"
                    if(inDictionary(rootMovement) 
                        // TODO: must be a better way to do this
                        // TODO: should find a better way for these edge cases
                        // TODO: Scrape wikipedia for the title and see if 404
                        && rootMovement.toLowerCase() != "ism"
                        && rootMovement.toLowerCase() != "sm"
                        || rootMovement.toLowerCase() == "nomism"
                        || rootMovement.toLowerCase() == "montanism"
                        || rootMovement.toLowerCase() == "gaianism"
                        || rootMovement.toLowerCase() == "culturalism"
                    ){
    
                        // add movement to list
                        if(containsCaseInsensitive(arr, rootMovement)) {
                            arr = pushLowerCase(arr, rootMovement);
                        }
                        else {
                            arr.push(rootMovement);
                        }

                        // otherMovement = "ecoauthoritarianism"
                        // movement = "authoritarianism"
                        if(!movementsToRemove.includes(movement.toLowerCase()))
                        {
                            var c = rootMovement.toLowerCase().charAt(0);

                            if(!metaPrefix.hasOwnProperty(prefix.toLowerCase())){
                                metaPrefix[prefix.toLowerCase()] = {};
                            }
                            if(!metaPrefix[prefix.toLowerCase()].hasOwnProperty(c)){
                                metaPrefix[prefix.toLowerCase()][c] = -1;
                            }
                            else if(metaPrefix[prefix.toLowerCase()].hasOwnProperty(c)){
                                metaPrefix[prefix.toLowerCase()][c] -= 1;
                            }

                        }

                        // track movements to remove
                        if(!movementsToRemove.includes(movement.toLowerCase()))
                        {

                            movementsToRemove.push(movement.toLowerCase());
                        }
                    }
                }
            });
        });

        movementsToRemove.forEach(movement => {
            console.log(movement);
        });

        // remove movements whose prefix and root are saved
        arr = arr.filter(e => !movementsToRemove.includes(e.toLowerCase()));

        movementsToRemove = [];

        arr.sort();
    }

    return arr;
}

(async () => {

    /*//////////////////////////////////////////////////////////////////////////
    ///
    /// Data retrieval
    ///
    //////////////////////////////////////////////////////////////////////////*/

    // Get the data
    //await getDepartmentTopics();
    //await getArtMovements();
    artMovements = await getIdeologies(artMovementUrl, artMovements);
    ideologies = await getIdeologies(ideologyUrl, ideologies);

    // Sort the data
    prefixes.sort();
    adjectives.sort();
    // ref: https://stackoverflow.com/questions/5467129/sort-javascript-object-by-key
    metaPrefix = Object.keys(metaPrefix).sort().reduce(
        (obj, key) => { 
          obj[key] = metaPrefix[key]; 
          return obj;
        }, 
        {}
    );

    /*//////////////////////////////////////////////////////////////////////////
    ///
    /// Check data
    ///
    //////////////////////////////////////////////////////////////////////////*/

    // import test data
    var testData = require("./testData");
    var testPrefixes = testData.prefixes;
    var testAdjectives = testData.adjectives;
    var testArtMovements = testData.artMovements;
    var testIdeologies = testData.ideologies;
    var testCombIdeologies = testData.combIdeologies;
    var testMetaPrefix = testData.metaPrefix;

    console.log(prefixes.length - testPrefixes.length);
    console.log(adjectives.length - testAdjectives.length);
    console.log(artMovements.length - testArtMovements.length);
    console.log(ideologies.length - testIdeologies.length);
    console.log(combIdeologies.length - testCombIdeologies.length);
    console.log(JSON.stringify(metaPrefix).toLowerCase() === JSON.stringify(testMetaPrefix).toLowerCase());

    var writeFile = true;
    
    console.log("==========================\nMissing prefixes:");

    testPrefixes.forEach(testPrefix => {
        if(!containsCaseInsensitive(prefixes, testPrefix)){
            writeFile = false;
            console.log(testPrefix);
        }
    });

    console.log("Missing adjectives:")

    testAdjectives.forEach(testAdjective => {
        if(!containsCaseInsensitive(adjectives, testAdjective)){
            writeFile = false;
            console.log(testAdjective);
        }
    });

    console.log("Missing art movements:")

    testArtMovements.forEach(testArtMovement => {
        if(!containsCaseInsensitive(artMovements, testArtMovement)){
            writeFile = false;
            console.log(testArtMovement);
        }
    });

    console.log("Missing ideologies:")

    testIdeologies.forEach(testIdeology => {
        if(!containsCaseInsensitive(ideologies, testIdeology)){
            writeFile = false;
            console.log(testIdeology);
        }
    });

    console.log("Missing combIdeologies:")

    testCombIdeologies.forEach(testCombIdeology => {
        if(!containsCaseInsensitive(combIdeologies, testCombIdeology)){
            writeFile = false;
            console.log(testCombIdeology);
        }
    });

    console.log("Differing keys in metaPrefix:")

    for(const [key, value] of Object.entries(testMetaPrefix)){
        if(!metaPrefix.hasOwnProperty(key.toLowerCase())){
            writeFile = false;
            console.log(key);
        } else {
            if(JSON.stringify(testMetaPrefix[key]) !== JSON.stringify(metaPrefix[key])){
                writeFile = false;
                console.log(key + ":")
                console.log(testMetaPrefix[key])
            }
        }
    }

    console.log("==========================\nAdded prefixes:")

    prefixes.forEach(prefix => {
        if(!containsCaseInsensitive(testPrefixes, prefix)){
            writeFile = false;
            console.log(prefix);
        }
    });

    console.log("Added adjectives:")

    adjectives.forEach(adjective => {
        if(!containsCaseInsensitive(testAdjectives, adjective)){
            writeFile = false;
            console.log(adjective);
        }
    });

    console.log("Added art movements:")

    artMovements.forEach(artMovement => {
        if(!containsCaseInsensitive(testArtMovements, artMovement)){
            writeFile = false;
            console.log(artMovement);
        }
    });

    console.log("Added ideologies:")

    ideologies.forEach(ideology => {
        if(!containsCaseInsensitive(testIdeologies, ideology)){
            writeFile = false;
            console.log(ideology);
        }
    });

    console.log("Added combIdeologies:")

    combIdeologies.forEach(combIdeology => {
        if(!containsCaseInsensitive(testCombIdeologies, combIdeology)){
            writeFile = false;
            console.log(combIdeology);
        }
    });

    console.log("Added keys in metaPrefix:")

    for(const [key, value] of Object.entries(metaPrefix)){
        if(!testMetaPrefix.hasOwnProperty(key.toLowerCase())){
            writeFile = false;
            console.log(key);
        } else {
            if(JSON.stringify(metaPrefix[key]) !== JSON.stringify(testMetaPrefix[key])){
                writeFile = false;
                console.log(key + ":")
                console.log(metaPrefix[key])
            }
        }
    }

    /*//////////////////////////////////////////////////////////////////////////
    ///
    /// Write data to file
    ///
    //////////////////////////////////////////////////////////////////////////*/

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

    if(writeFile)
    {
        fs.writeFileSync('data.js', insertString, 'utf-8');
    }

    console.log("File overwritten: " + writeFile);
    
})()