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

(async () => {
    const $ = await fetchData();
        
    $(".mw-parser-output > ul > li").each((index, element) => {

        // get Art Movement as array of strings
        var movementWords = $(element).text().split(" ");
        
        // get last word in array
        // TODO: Account for proper nouns
        var lastWord = movementWords[movementWords.length - 1].toLowerCase();
        
        // if last word is an -ism
        if( lastWord.slice(-3) == "ism" ) {

            // split by hyphen if one exists
            var prefixAndMovement = lastWord.split("-");

            // if word not already present in art movements array
            if(!artMovements.includes(lastWord)) {
                artMovements.push(lastWord);
            }
        }
    });

    console.log(artMovements)

})()