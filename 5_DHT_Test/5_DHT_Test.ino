#include "DHT.h" //DHT Library
#define pinDHT 2     //DHT communication pin
#define typeDHT DHT22 //DHT sensor type, in this case DHT22

DHT dht(pinDHT, typeDHT); //declaring an DHT object

void setup() {
  Serial.begin(9600);
  dht.begin(); //initialize DHT object
}

void loop() {

  //read humidity and temperature
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  
  //sensor read failure check
  if (isnan(h) || isnan(t)) {
    Serial.print("DHT failed");
  }
  //Show the information on Monitor Serial
  Serial.print("Humidity: ");
  Serial.print(h);
  Serial.print("%\n");
  Serial.print("Temperature: ");
  Serial.print(t);
  Serial.print("°C\n");

  delay(2000);
}
