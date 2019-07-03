var channelID = 695672;
var writeKey = "ZY113X3ZSZG96YC8"; 

var dataField5; /* Thinkspeak data: Echo from Device 1 commanded by Field 7 */

function turnOnPump() {
        $(document).ready(function(){
            $.post("https://api.thingspeak.com/update.json",
            {
              api_key: writeKey,
              field5: 1
            },
            function(){
                
            });
            alert("teste!");
        });
 }

                          
                          
     