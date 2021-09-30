// Import required libraries
#include <ESP8266WiFi.h>
#include "ESPAsyncWebServer.h"
#include <Wire.h>

// Set your access point network credentials
const char* ssid = "BeThere-Slave";
const char* password = "slavewelcome";

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);

const int RELAY = 0;

void setup(){
  // Serial port for debugging purposes
  Serial.begin(115200);
  pinMode(RELAY,OUTPUT);
  
  // Setting the ESP as an access point
  Serial.print("Setting AP (Access Point)…");
  // Remove the password parameter, if you want the AP (Access Point) to be open
  WiFi.softAP(ssid, password);

  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP);

  server.on("/RELAY_ON", HTTP_GET, [](AsyncWebServerRequest *request){
    digitalWrite(RELAY, HIGH);
    Serial.println("ON");
    Serial.println(RELAY);
    request->send(200, "text/plain", "OK");
  });
  server.on("/RELAY_OFF", HTTP_GET, [](AsyncWebServerRequest *request){
    digitalWrite(RELAY, LOW);
    Serial.println("OFF");
    Serial.println(RELAY);
    request->send(200, "text/plain", "OK");
  });
  
// Start server
  server.begin();
}
 
void loop(){
  
}
