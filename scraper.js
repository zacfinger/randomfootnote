const siteUrl = "https://en.wikipedia.org/wiki/List_of_art_movements";
const axios = require("axios");
const cheerio = require("cheerio");
var thesaurus = require("thesaurus");

const fetchData = async () => {
  const result = await axios.get(siteUrl);
  return cheerio.load(result.data);
};

var artMovements = 
// from acb's original pb script:
[ "surrealism" , "modernism" , "realism" , 
"constructivism" , "expressionism" ];

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
    return thesaurus.find(prefix).length > 0;

}

(async () => {
    const $ = await fetchData();
        
    $(".mw-parser-output > ul > li").each((index, element) => {

        // get Art Movement as array of strings
        var movementWords = $(element).text().split(" ");
        
        // get last word in array
        // TODO: Account for proper nouns, i.e. "Pre-Raphaelitism"
        var lastWord = movementWords[movementWords.length - 1].toLowerCase();
        
        // if last word is an -ism
        if( lastWord.slice(-3) == "ism" ) {

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
            if(!artMovements.includes(lastWord)) {
                artMovements.push(lastWord);
            }
        }
    });

    // extract prefixes from derivative movements
    // i.e., modernism --> postmodernism yields "post-"
    // TODO: doesn't work for massurrealism vs surrealism
    artMovements.forEach(movement => {

        artMovements.forEach(otherMovement => {
            // if this is a derivative of another movement
            // i.e., "postmodernism" ends with "modernism"
            if(otherMovement != movement 
                && otherMovement.endsWith(movement)) {

                // only extract prefix and movement
                // if prefix + movement without "ism" is a word in dictionary
                // this allows for "realism" vs "surrealism"
                // by checking if root "sur" in dictionary
                // will fail if root is "surreal"
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

    // remove movements whose prefix and root are saved
    artMovements = artMovements.filter(e => !movementsToRemove.includes(e));

    // extract prefixes which did not have prefix with hyphen
    // iterate through each movement
    artMovements.forEach(movement => { 

        // if movement starts with one of the found prefixes
        prefixes.forEach(prefix => {
            if(movement.startsWith(prefix)){
                console.log(movement);
                /*if(!rootWordInDictionary(movement)) {

                }*/
            }
        })
    });

    //console.log(artMovements);
    //console.log(prefixes);

})()