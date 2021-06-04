const artMovementUrl = "https://en.wikipedia.org/wiki/List_of_art_movements";
const ideologyUrl = "https://en.wikipedia.org/wiki/List_of_political_ideologies";
const axios = require("axios");
const cheerio = require("cheerio");
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

var adjectives = [];

var movementsToRemove = [];

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

    const $ = await fetchData(ideologyUrl);

    $(".mw-parser-output > ul > li").each((index, element) => {

        // get ideology as array of strings separated by \n
        // TODO: trim() on getArtMovements() as well
        var ideologyLines = $(element).text().trim().split("\n");
        
        ideologyLines.forEach(line => {
            
            // get ideology as array of strings
            var ideologyWords = line.split(" ");

            // get last word in array
            // TODO: Account for proper nouns, i.e. "Marxism"
            // // User "list of ideologies named after people"
            var lastWord = ideologyWords[ideologyWords.length - 1].toLowerCase();

            if (lastWord.slice(-3) == "ism"){
                
                // split by hyphen if one exists
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
                if(!ideologies.includes(lastWord)) {
                    ideologies.push(lastWord);
                }
            }
            
        });

    });
}

const getArtMovements = async() => {

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
                && otherMovement != "massurrealism") {

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
            if(movement.startsWith(prefix)){
                // find string after prefix
                var rootMovement = movement.substring(prefix.length);
                
                if(inDictionary(rootMovement)){
                    if(!artMovements.includes(rootMovement)){
                        artMovements.push(rootMovement);
                        
                        // track movements to remove
                        if(!movementsToRemove.includes(movement)){
                            
                            movementsToRemove.push(movement);
                        }

                    }

                }
            }
        })
    });
    console.log(movementsToRemove);

    // remove movements whose prefix and root are saved
    artMovements = artMovements.filter(e => !movementsToRemove.includes(e));
    
    artMovements.sort();
    
};

(async () => {
    
    await getArtMovements();
    //await getIdeologies();

    console.log(artMovements);
    console.log(prefixes);
    

})()