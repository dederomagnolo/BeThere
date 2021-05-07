function minutesToMilliseconds(time) {
    return time*60*1000;
}

function secondsToMilliseconds(time) {
    return time*1000;
}

function getRandomInt( min, max ) {
    return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

function generateProductKey() {
   var tokens = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
       chars = 5,
       segments = 4,
       keyString = "";
       
   for( var i = 0; i < segments; i++ ) {
       var segment = "";
       for( var j = 0; j < chars; j++ ) {
           var k = getRandomInt( 0, 35 );
           segment += tokens[ k ];
       }
       keyString += segment;
       
       if( i < ( segments - 1 ) ) {
           keyString += "-";
       }
   }
   
   return keyString;
}

module.exports = {
    secondsToMilliseconds,
    minutesToMilliseconds,
    generateProductKey
};
