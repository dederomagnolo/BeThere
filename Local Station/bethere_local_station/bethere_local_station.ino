#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <Wire.h>
#include "SPI.h"
#include <LiquidCrystal_I2C.h>
#include <ThingSpeak.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <ArduinoWebsockets.h>
#include <ESP8266WebServer.h>

// Pins definition
#define pinDHT 12 //D6
#define pinDHT2 13 //D7
#define pinDHT3 14 //D5
#define typeDHT DHT22
#define pumpInputRelay 16 // D0
#define gasInput A0

using namespace websockets;

// Object declarations
WiFiClient client;
WebsocketsClient wsclient;
LiquidCrystal_I2C lcd(0x27, 16, 2);

//Device serial number
const char *serialKey = "34PQL-YBAZJ-TVVHL-77HRV";

// NTP
const long utcOffsetInSeconds = -10800;
WiFiUDP ntpUDP;
//NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds);

// DHT
DHT dht(pinDHT, typeDHT);
DHT dht2(pinDHT2, typeDHT);
DHT dht3(pinDHT3, typeDHT);

// Network credentials
//char ssid[] = "Satan`s Connection";
//char password[] = "tininha157";
//char ssid[] = "iPhone de Débora";
//char password[] = "texas123";
//char ssid[] = "cogumelos";
//char password[] = "saocarlos";
//char ssid[] = "torta de palmito";
//char password[] = "tininha123";

// Thingspeak credentials
unsigned long myChannelNumber = 695672;
const char * myWriteAPIKey = "ZY113X3ZSZG96YC8";

// WiFi Setup variables
const char *ssid = "BeThere Access Point";
const char *password = "welcome123";

// Start server
ESP8266WebServer server(80);
// Server settings
IPAddress ap_local_IP(192,168,1,1);
IPAddress ap_gateway(192,168,1,254);
IPAddress ap_subnet(255,255,255,0);

// websocket infos
// const char* websocketServerHost = "192.168.0.12"; 
// const int websocketServerPort = 8080; 
const char* websocketServerHost = "https://bethere-be.herokuapp.com"; 

// Variables declaration
int pumpFlag = 0; 
unsigned long beginCommandTimer = 0;
unsigned long beginPumpTimer = 0;
unsigned long pongTimer = 0;
unsigned long interval = 900000;
unsigned long pumpMaxInterval = 600000; // 10 minutes
unsigned long maxPongInterval= 42000; // 40 secs
float internalTemperature = 0;
float internalHumidity = 0;
bool withoutConfig;
bool bypassWifi = false;

const char INDEX_HTML[] =
"<!DOCTYPE HTML>"
"<html>"
"<head>"
"<meta content=\"text/html; charset=ISO-8859-1\""
" http-equiv=\"content-type\">"
"<meta name = \"viewport\" content = \"width = device-width, initial-scale = 1.0, maximum-scale = 1.0, user-scalable=0\">"
"<title>BeThere - Network Settings</title>"
"<style>"
"\"body { background-color: #808080; font-family: Arial, Helvetica, Sans-Serif; Color: #000000; }\""
"</style>"
"</head>"
"<body>"
"<h1>BeThere - Network Settings</h1>"
"<FORM action=\"/\" method=\"post\">"
"<P>"
"<label>ssid:&nbsp;</label>"
"<input maxlength=\"30\" name=\"ssid\"><br>"
"<label>Password:&nbsp;</label><input maxlength=\"30\" name=\"Password\"><br>"
"<INPUT type=\"submit\" value=\"Send\">"
"</P>"
"</FORM>"
"<button onclick=\"window.location.href='/reset'\"> Reset network configs </button>"
"<button onclick=\"window.location.href='/without-wifi'\">  Start without connection </button>"
"</body>"
"</html>";

void setup() {
  
  // erase every esp config before start
  ESP.eraseConfig();
  
  // initialize output for relay and put it high
  pinMode(pumpInputRelay, OUTPUT);
  digitalWrite(pumpInputRelay, HIGH); //bomba desligada

  // begin DHT sensors
  dht.begin();
  dht2.begin();
  dht3.begin();

  // begin serial port
  Serial.begin(115200);
  while (!Serial); // Waiting for Serial Monitor

  // start server for access point
  WiFi.softAPConfig(ap_local_IP, ap_gateway, ap_subnet);
  WiFi.softAP(ssid, password);
  // server routes
  server.on("/", handleRoot);
  server.on("/reset", handleResetConfig);
  server.on("/without-wifi" , handleBypassWifi);
  server.begin();
  Serial.println("HTTP server started");
  WiFi.softAPConfig(ap_local_IP, ap_gateway, ap_subnet);
  
  // initialize LCD
  lcd.begin(16,2);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  delay(500);
  lcd.print("BeThere started");
  delay(500);
  lcd.setCursor(0, 0);

  // try to auto connect with last session
  WiFi.getAutoConnect();
  delay(5000);
  if(WiFi.status() == WL_CONNECTED) {
    Serial.println("...connected using last credentials!");
    withoutConfig = false;
    ESP.wdtFeed();
  } else {
    withoutConfig = true;
  }

  // begin wifi and try to connect
  // WiFi.begin(ssid, password);
 
//  while(WiFi.status() != WL_CONNECTED) {
//  delay(500);
//  Serial.println("...connecting!"); 
//  yield();
//  ESP.wdtFeed();
//  }
  Serial.println("BeThere connected! :D");

  // connect with websocket server
  // bool connected = wsclient.connect(websocketServerHost, websocketServerPort, "/");
  bool connected = wsclient.connect(websocketServerHost);
  
  if(connected) {
    Serial.println("Connected with BeThere websocket server!");
    wsclient.send("BeThere is alive");
    wsclient.send(String("$S") + serialKey);
  } else {
    Serial.println("Not Connected!");
  }

  // callback where the messages are received
    wsclient.onMessage([&](WebsocketsMessage message){
        pongTimer = millis();   
        Serial.println("pong timer started");      
        Serial.print("Message from server: ");
        Serial.println(message.data());
        if(message.data() == "RESET_ESP") {
          ESP.restart();
        }

        if(message.data() == "LCD_ON") {
          lcd.backlight();
        }

        if(message.data() == "LCD_OFF") {
          lcd.noBacklight();
        }
        // change state
        if(message.data() == "0") {
          digitalWrite(pumpInputRelay, HIGH);
          beginPumpTimer = 0;
        }
        
        if(message.data() == "1") {
          digitalWrite(pumpInputRelay, LOW);
          beginPumpTimer = millis();
        } else {
          int lastStat = digitalRead(pumpInputRelay);
          digitalWrite(pumpInputRelay, lastStat);

          if(lastStat == LOW) {
            wsclient.send("Pump on!");
          } else {
            wsclient.send("Pump off!");
          }

          yield();  
        }  
    });
 
  ThingSpeak.begin(client);
}

void loop() {
  server.handleClient();
  
  // wi fi recover
  if(!withoutConfig) {
    if(WiFi.status() != WL_CONNECTED) {
      Serial.println("Connection lost!");
      lcd.setCursor(15,0);
      lcd.print("*");
      WiFi.reconnect();
      delay(1000);
      yield();
      ESP.wdtFeed();
    } else {
      lcd.setCursor(15,0);
      lcd.print(" ");
    }
  }

  if(WiFi.status() != WL_CONNECTED) {
    lcd.setCursor(15,0);
    lcd.print("*");
  } else {
    lcd.setCursor(15,0);
    lcd.print(" ");
  }

  // Waiting for connection
  while(withoutConfig) {
    server.handleClient();
    lcd.setCursor(0, 0);
    lcd.print("Without connection");
    lcd.setCursor(0 ,1);
    lcd.print("Search WiFi BeThere");

    if(bypassWifi) {
      lcd.clear();
      lcd.setCursor(0 ,0);
      lcd.print("Starting!");
      delay(1500);
      lcd.clear();
      withoutConfig = false;
    };
    ESP.wdtFeed();
  }
  Serial.println(wsclient.available());

  // connection with websocket recover
  if(wsclient.available()) {
    lcd.setCursor(15,1);
    lcd.print(" ");
    if(millis() - pongTimer > maxPongInterval) {
      Serial.println("no response, close connection");
      wsclient.close();
      pongTimer = 0; 
    }
    wsclient.poll();
    yield();
  } else {
    Serial.println("reconnecting to websocket server...");
    lcd.setCursor(15,1);
    lcd.print("*");
    // wsclient.connect(websocketServerHost, websocketServerPort, "/");
    wsclient.connect(websocketServerHost);
    wsclient.send("Be There is alive!");
    wsclient.send(String("$S") + serialKey);
    pongTimer = millis();
  }
  
  // control pump from remote
  if(beginPumpTimer > 0) {
    Serial.println("Remote mode activated");
    digitalWrite(pumpInputRelay, LOW);
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
  float humidity2 = dht2.readHumidity();
  float temperature2 = dht2.readTemperature();
  float externalHumidity = dht3.readHumidity();
  float externalTemperature = dht3.readTemperature();

  // calculate the mean for internal sensors
  internalTemperature = temperature2;
  internalHumidity = humidity2;

  // Write the measures on LCD 
  lcd.setCursor(0, 0);
  lcd.print("H:");
  lcd.setCursor(2, 0);

  if (isnan(internalHumidity)) {
    lcd.print("--.-");
  } else {
    lcd.print(internalHumidity, 1);
    // clear empty space
    lcd.setCursor(6, 0);
    lcd.print(" ");
  }
  
  lcd.setCursor(0 ,1);
  lcd.print("T:");
  lcd.setCursor(2 ,1);

  if (isnan(internalTemperature)) {
    lcd.print("--.-");
  } else {
    lcd.print(internalTemperature, 1);
  }
  
  delay(200);
  
  lcd.setCursor(6, 0);
  lcd.print(" ");
  lcd.setCursor(7, 0);
  lcd.print("H2:");
  lcd.setCursor(10, 0);
  
  if (isnan(externalHumidity)) {
    lcd.print("--.-");
  } else {
    lcd.print(externalHumidity, 1);
  }

  lcd.setCursor(6, 1);
  lcd.print(" ");
  lcd.setCursor(7 ,1);
  lcd.print("T2:");
  lcd.setCursor(10 ,1);
  
  if (isnan(externalTemperature)) {
    lcd.print("--.-");
  } else {
    lcd.print(externalTemperature, 1);
  }
  
  delay(200);

  //Just for debug - print in serial monitor
  Serial.println("H:" + String(humidity) + "T:" + String(temperature));
  Serial.println("H2:" + String(humidity2) + "T2:" + String(temperature2));
  Serial.println("H3:" + String(externalHumidity) + "T3:" + String(externalTemperature));
  Serial.println("Media T1 T2:" + String(internalTemperature));
  Serial.println("Media H1 H2:" + String(internalHumidity));  

  // TESTING: SEND MEASURES TO WEBSOCKET SERVER
  //  String measures = "H1:" + String(internalHumidity) + "T1:" +String(internalTemperature) + "H2:" + String(externalHumidity) + "T2:" + String(externalTemperature);
  //  if(wsclient.available()) {
  //    wsclient.send(measures);
  //    yield();
  //  }

  if(millis() - beginCommandTimer > interval) {
      Serial.println("Sending data..."); 
      // ThingSpeak - Set fields
      ThingSpeak.setField(3, internalHumidity);
      ThingSpeak.setField(4, internalTemperature);
      ThingSpeak.setField(5, externalHumidity);
      ThingSpeak.setField(6, externalTemperature);
     
      // ThingSpeak - Write fields
      int response = ThingSpeak.writeFields(myChannelNumber,myWriteAPIKey);
      client.flush();
      // Check status response
      if (response == 200){
        Serial.println("Data sent with success!");
        beginCommandTimer = millis();
        
      } else{
        Serial.println("Coneection Error: " + String(response));
      }
  }
  delay(2000);
}

void handleRoot() {
  if (server.hasArg("ssid")&& server.hasArg("Password")) {//If all form fields contain data call handelSubmit()
   handleSubmit();
  }
  else {//Redisplay the form
    server.send(200, "text/html", INDEX_HTML);
  }
}

void handleResetConfig() {
    ESP.eraseConfig();
    server.send(200, "text/html", INDEX_HTML);
    ESP.reset();
}

void handleBypassWifi() {
  bypassWifi = true;
}

//dispaly values and write to memmory
void handleSubmit(){
  lcd.clear();
  
  String response="<p>The following configuration was saved with success.";
  response += "<br>";
  response += "network name:";
  response += server.arg("ssid");
  response +="<br>";
  response +="password:";
  response +=server.arg("Password");
  response +="<br>";
  response +="</p><br>";
  response +="<h2><a href=\"/\">go back to main screen</a></h2><br>";

 server.send(200, "text/html", response);
 
 WiFi.begin(server.arg("ssid"), server.arg("Password"));
 while(WiFi.status() != WL_CONNECTED) {
  delay(500);
  Serial.println("...connecting!"); 
  ESP.wdtFeed();
  }
  Serial.println("BeThere connected! :D");
  withoutConfig = false;
  delay(500);
  lcd.clear();
}
