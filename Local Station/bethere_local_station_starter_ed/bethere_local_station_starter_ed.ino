#include <Adafruit_Sensor.h>
#include <DHT.h>
#include "ESP8266WiFi.h"
#include <WiFiClient.h>
#include <Wire.h>
#include "SPI.h"
#include <LiquidCrystal_I2C.h>
#include <ThingSpeak.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <ArduinoWebsockets.h>

// Pins definition
#define pinDHT 14 //D5
#define typeDHT DHT22
#define pumpInputRelay 16 // D0
#define externalSwitch 

using namespace websockets;

// Object declarations
WiFiClient client;
WebsocketsClient wsclient;
LiquidCrystal_I2C lcd(0x27, 16, 2);

// NTP
const long utcOffsetInSeconds = -10800;
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds);

// DHT
DHT dht(pinDHT, typeDHT);

// Network credentials
char ssid[] = "Satan`s Connection";
char password[] = "tininha157";

// Thingspeak credentials
unsigned long myChannelNumber = 700837;
const char * myWriteAPIKey = "EZWNLFRNU5LW6XKU";

// websocket infos
//const char* websocketServerHost = "192.168.0.12"; 
//const int websocketServerPort = 8080; 
const char* websocketServerHost = "https://bethere-be.herokuapp.com/"; 

// Variables declaration
int pumpFlag = 0; 
unsigned long beginCommandTimer = 0;
unsigned long beginPumpTimer = 0;
unsigned long pongTimer = 0;
unsigned long interval = 900000;
unsigned long pumpMaxInterval = 600000;
unsigned long maxPongInterval= 46000;
float internalTemperature = 0;
float internalHumidity = 0;

void setup() {
  
  // erase every esp config before start
  ESP.eraseConfig();
  
  // initialize output for relay and put it high
  pinMode(pumpInputRelay, OUTPUT);
  digitalWrite(pumpInputRelay, HIGH); //bomba desligada

  // begin DHT sensors
  dht.begin();

  // begin serial port
  Serial.begin(19200);

  // initialize LCD
  lcd.begin(16,2);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  delay(500);
  lcd.print("BeThere Started!");
  delay(500);
  lcd.setCursor(0, 0);

  // begin wifi and try to connect
  WiFi.begin(ssid, password);
 
  while(WiFi.status() != WL_CONNECTED) {
  delay(500);
  Serial.println("...connecting!"); 
  yield();
  ESP.wdtFeed();
  }
  Serial.println("BeThere connected! :D");

  // connect with websocket server
  // bool connected = wsclient.connect(websocketServerHost, websocketServerPort, "/");
  bool connected = wsclient.connect(websocketServerHost);
  
  if(connected) {
    Serial.println("Connected with BeThere websocket server!");
    wsclient.send("Olar");
  } else {
    Serial.println("Not Connected!");
    return;
  }

  // callback where the messages are received
    wsclient.onMessage([&](WebsocketsMessage message){        
        Serial.print("Message from server: ");
        Serial.println(message.data());
        
        // change pump state
        if(message.data() == "1") {
          digitalWrite(pumpInputRelay, LOW);
          beginPumpTimer = millis();
        } else if(message.data() == "beat") {
          int lastStat = digitalRead(pumpInputRelay);
          digitalWrite(pumpInputRelay, lastStat);

          if(lastStat == LOW) {
            wsclient.send("Pump on!");
          } else {
            beginPumpTimer = 0;
            wsclient.send("Pump off!");
          }
          yield();
           
        } else {
          digitalWrite(pumpInputRelay, HIGH);
          wsclient.send("Pump off!");
          yield();
        } 

        pongTimer = millis();
        Serial.println("pong timer started");
    });
 
  ThingSpeak.begin(client);
}

void loop() {
  // lcd.noBacklight();
//  timeClient.update();
//  Serial.print(timeClient.getDay());
//  Serial.print(", ");
//  Serial.print(timeClient.getHours());
//  Serial.print(":");
//  Serial.print(timeClient.getMinutes());

  // wi fi recover
  if(WiFi.status() != WL_CONNECTED) {
    Serial.println("Connection lost!");
    WiFi.reconnect();
    delay(1000);
    yield();
    ESP.wdtFeed();
  }

  // connection with websocket recover
  Serial.println(wsclient.available());
  Serial.println(wsclient.poll());
  if(wsclient.available()) {

    if(millis() - pongTimer > maxPongInterval) {
      Serial.println("no response, close connection");
      wsclient.close();
      pongTimer = 0;  
    }

    wsclient.poll();
    yield();
  } else {
    Serial.println("reconnecting to websocket server...");
    // wsclient.connect(websocketServerHost, websocketServerPort, "/");
    wsclient.connect(websocketServerHost);
    wsclient.send("Be There is alive!"); 
  }
  
  // control pump from remote
  if(beginPumpTimer > 0) {
    Serial.println("Remote mode activated");
    wsclient.send("R1"); 
    if(millis() - beginPumpTimer > pumpMaxInterval){
      digitalWrite(pumpInputRelay, HIGH);
      beginPumpTimer = 0;
      wsclient.send("R0"); 
      Serial.println("Pump finished the work!");
    } else {
      Serial.println("Pump is on!");
    }
  }
  
  // Read humidity and temperature from DHT22 sensors
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  // Write the measures on LCD 
  lcd.setCursor(0, 0);
  lcd.print("H:");
  lcd.setCursor(2, 0);

  if (isnan(humidity)) {
    lcd.print("--.--");
  } else {
    lcd.print(humidity);
  }
  
  lcd.setCursor(0 ,1);
  lcd.print("T:");
  lcd.setCursor(2 ,1);

  if (isnan(temperature)) {
    lcd.print("--.--");
  } else {
    lcd.print(temperature);
  }
  
  delay(200);
  
  //Just for debug - print in serial monitor
  Serial.println("H:" + String(humidity) + "T:" + String(temperature));

  // TESTING: SEND MEASURES TO WEBSOCKET SERVER
  //  String measures = "H1:" + String(internalHumidity) + "T1:" +String(internalTemperature) + "H2:" + String(externalHumidity) + "T2:" + String(externalTemperature);
  //  if(wsclient.available()) {
  //    wsclient.send(measures);
  //    yield();
  //  }

//  if(millis() - beginCommandTimer > interval) {
//      Serial.println("Sending data..."); 
//      // ThingSpeak - Set fields
//      ThingSpeak.setField(1, humidity);
//      ThingSpeak.setField(2, temperature);
//     
//      // ThingSpeak - Write fields
//      int response = ThingSpeak.writeFields(myChannelNumber,myWriteAPIKey);
//      client.flush();
//      // Check status response
//      if (response == 200){
//        Serial.println("Data sent with success!");
//        beginCommandTimer = millis();
//        
//      } else{
//        Serial.println("Coneection Error: " + String(response));
//      }
//  }


  delay(2000);
}
