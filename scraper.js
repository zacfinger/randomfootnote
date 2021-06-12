/*//////////////////////////////////////////////////////////////////////////////
///
/// TO DO:
/// 
/// TODO: Maintain each string in array as lower-case. Determine if 
/// capitalization is necessary by maintaining count of times term is 
/// capitalized or not, and favoring one or the other in the end. This ensures
/// proper nouns are always capitalized if they are in the source content.
///
/// TODO: Enforce hyphenization on prefixes by maintaining count of times the 
/// prefix is hyphenated or not, and favoring one or the other in the end.
///
/// TODO: Account for "Antidisestablishmentarianism" - it will never occur with
/// the current algorithm
/// 
/// TODO: Determine why "" appears in prefixes
///
//////////////////////////////////////////////////////////////////////////////*/

const artMovementUrl = "https://en.wikipedia.org/wiki/List_of_art_movements";
const ideologyUrl = "https://en.wikipedia.org/wiki/List_of_political_ideologies";
const axios = require("axios");
const cheerio = require("cheerio");
var pos = require("pos");
var thesaurus = require("thesaurus");

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

    $(".mw-parser-output > ul > li").each((index, element) => {

        // get ideology as array of strings separated by \n
        var ideologyLines = $(element).text().trim().split("\n");
        
        ideologyLines.forEach(line => {

            // Filter out sentences
            // TODO: Needs improvement...could miss some ideologies
            if(line.indexOf(".") < 0){
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
                        ){
                            ideologyWords[ideologyWords.length - 2] = ideologyWords[ideologyWords.length - 2].toLowerCase() + " " + lastWord.toLowerCase();

                            lastWord = ideologyWords[ideologyWords.length - 2];

                            ideologyWords.pop();
                        }
                    }

                    // account for ideology "saint-simonianism"
                    if(lastWord.toLowerCase() != "saint-simonianism"){
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

                            // add to array of prefixes
                            if(!prefixes.includes(prefix)) {
                                prefixes.push(prefix);
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
                            var word = ideologyWords[i].toLowerCase();
                            var tagger = new pos.Tagger();
                            var tags = tagger.tag([word]);
                            if(tags[0][1] == 'CC' || tags[0][1] == 'DT' || tags[0][1] == 'IN'){
                                index = i;
                                //exit for
                                break;
                            }
                        }

                        var word = ideologyWords.slice(index + 1, ideologyWords.length - 1).toString().replace(/[,]+/g, " ").trim();
                        
                        if(!adjectives.includes(word)){
                            adjectives.push(word);
                        }
                    }                
                }
            }
        });
    });

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
                && movement.toLowerCase() != "anationalism"       // created prefix "ultr-"
                && otherMovement.toLowerCase() != "veganarchism"  // created prefix "veg-"
                && otherMovement.toLowerCase() != "panarchism"    // created movement "archism"
                && otherMovement.toLowerCase() != "eurasianism"   // created prefix "eur-"
                && otherMovement.toLowerCase() != "impossibilism" // created prefix "im-"
                && otherMovement.toLowerCase() != "intactivism"   // created prefix "int-"
                && otherMovement.toLowerCase() != "confederalism" // created prefix "con-"
                && otherMovement.toLowerCase() != "antidisestablishmentarianism"
                                                    // created prefix "antidis-"
            ){
                // extract prefix
                index = otherMovement.indexOf(movement);
                prefix = otherMovement.substring(0, index);

                // add prefix to array
                if(!prefixes.includes(prefix)){
                    prefixes.push(prefix);
                }

                // track movements to remove
                if(!movementsToRemove.includes(otherMovement)){
                    movementsToRemove.push(otherMovement);
                }
            }
        })
    });

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

                    // track movements to remove
                    if(!movementsToRemove.includes(movement)){

                        movementsToRemove.push(movement);
                    }
                }
            }
        });
    });

    // TODO: While loop runs until no more prefixes/movements found
    // Loops through both of the above for loops

    console.log(movementsToRemove);

    // remove movements whose prefix and root are saved
    ideologies = ideologies.filter(e => !movementsToRemove.includes(e));
    
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

                    // track movements to remove
                    if(!movementsToRemove.includes(movement)){
                            
                        movementsToRemove.push(movement);
                    }
                }
            }
        })
    });
    
    // TODO: While loop runs until no more prefixes/movements found
    // Loops through both of the above for loops

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
    // https://en.wikipedia.org/wiki/List_of_new_religious_movements
    // List of religions
    // https://en.wikipedia.org/wiki/List_of_architectural_styles
    // TODO: Get list of theorists/philosophers
    // https://en.wikipedia.org/w/index.php?search=List+of+theorists&title=Special%3ASearch&go=Go&ns0=1
    // https://en.wikipedia.org/wiki/List_of_academic_fields
    
    await getArtMovements();
    await getIdeologies();

    prefixes.sort();
    adjectives.sort();

    prefixes.forEach(prefix => {
        console.log(prefix); //57
    });

    adjectives.forEach(adj => {
        console.log(adj); //278
    });

    artMovements.forEach(movement => {
        console.log(movement); //42
    });

    ideologies.forEach(ideology => {
        console.log(ideology); //371
    });

    console.log(prefixes.length);
    console.log(adjectives.length);
    console.log(artMovements.length);
    console.log(ideologies.length);

})()