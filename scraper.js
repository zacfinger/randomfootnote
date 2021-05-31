const siteUrl = "https://en.wikipedia.org/wiki/List_of_art_movements";
const axios = require("axios");
const cheerio = require("cheerio");

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

            if(!artMovements.includes(lastWord)) {
                artMovements.push(lastWord);
            }
        }
    });

    // separate derivative movements and their prefixes
    // i.e., modernism --> post-modernism
    // TODO: account for 'realism' vs 'surrealism'
    artMovements.forEach(movement => {

        artMovements.forEach(otherMovement => {
            // if this is a derivative of another movement
            if(otherMovement != movement 
                && otherMovement.endsWith(movement)) {
                
                // extract prefix
                var index = otherMovement.indexOf(movement);
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
        });

        /* if movement starts with one of the prefixes
        prefixes.forEach(prefix => {
            if(movement.startsWith(prefix)){
                console.log(movement);
        }
    })*/
    });

    //console.log(artMovements);
    //console.log(prefixes);

})()