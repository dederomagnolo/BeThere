var channelID = 700837;
var readKey = "7SPOE8FAYBAASWNK"; 
var writeKey = "EZWNLFRNU5LW6XKU"; 
var cityName = " ";


var dataField1; /* Thinkspeak data: Soil Humidity */


function changeField1(data) {
        $(document).ready(function(){
            $.post("https://api.thingspeak.com/update.json",
            {
              api_key: "ZZZZZZZZZZZZZZZZZZZZZ",
              field1: data
            },
            function(){
          });
        alert ("Sent: "+data+" to field 1");
        });
      }

