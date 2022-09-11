#include <Adafruit_Sensor.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <Wire.h>
#include "DFRobot_SHT20.h"
#include <ThingSpeak.h>
#include <WiFiUdp.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoWebsockets.h>
#include <ESP8266WebServer.h>
#include <BeThere.h>

// #### DEVICE TO DEPLOY ####
// #define SHORT_SERIAL_KEY D_35U2I
//#define SHORT_SERIAL_KEY D_M5YZ5
#define SHORT_SERIAL_KEY D_P0HAM

// #### STATIC CONFIGS ####
#define USE_LOCAL_NETWORK false
#define USE_LOCAL_HOST true
#define ENABLE_DEV_MODE false
#define ENABLE_ACCESS_POINT false
#define ENABLE_DEBUGGER_LOGS true
#define RECONNECTION_RETRIES 8

// #### DHT PINS ####
// #define DHT_PIN 12 // d6
// #define DHT2_PIN 13 // d7
// #define DHT3_PIN 14 // d5
// #define DHT_TYPE DHT22

// #### CONFIGS FROM SERIAL - DEFAULT VALUES ####
bool ENABLE_LCD = true;
bool ENABLE_RELAY_LOW = false;
bool ENABLE_RELAY_PUSH_BUTTON = false;
bool ENABLE_ANALOG_SENSOR = false;
char ANALOG_SENSOR_KEY[5] = {" "};
int RELAY_PIN = 13; // d7
int PUSH_BUTTON_PIN = 10;
int ANALOG_PIN = A0;

// #### OBJECT DECLARATIONS ####
using namespace websockets;
WiFiClient client;
WebsocketsClient wsclient;
BeThere BeThere;
DFRobot_SHT20 sht20External;
DFRobot_SHT20 sht20Internal;
LiquidCrystal_I2C lcd(0x27, 16, 2);
StaticJsonDocument<200> doc;
DynamicJsonDocument measures(1024);

// #### KEYS ####
// Device serial key - DEV
char *SERIAL_KEY_DEV = "A0CAA-DN6PV-6U2OD-NPY1Q";
// Device serial key - PROD
char *SERIAL_KEY_PROD = SERIAL_KEY_DEV;
char *SERIAL_KEY_PROD_TEST = SERIAL_KEY_DEV;

// Thingspeak credentials - DEV
unsigned long TS_CHANNEL_NUM_DEV = 700837;
char *TS_WRITE_API_KEY_DEV = "EZWNLFRNU5LW6XKU";

// Thingspeak credentials - PROD
unsigned long TS_CHANNEL_NUM = TS_CHANNEL_NUM_DEV;
char * TS_WRITE_API_KEY = TS_WRITE_API_KEY_DEV;

// WiFi Credentials - PROD DEFAULT
char SSID_PROD[] = {"Sabatin"};
char SSID_PASSWORD_PROD[] = {"feliciano10"};

// WiFi Credentials - DEV
char SSID_DEV[] = "Sabatin";
char SSID_PASSWORD_DEV[] = "feliciano10";
//char SSID_DEV[] = "Satan`s Connection";
//char SSID_PASSWORD_DEV[] = "tininha157";

// #### TIMERS ####
unsigned long beginSendMeasureTimer = 0;
unsigned long beginRelayTimer = 0;
unsigned long beginWateringRoutineTimer = 0;
unsigned long lcdTimer = 0;
unsigned long pongTimer = 0;
unsigned long pumpMaxInterval = 1200000; // 20 minutes
unsigned long maxPongInterval = 42000; // 40 secs
// unsigned long lcdTimerMaxInterval = 60000;
// #### SETTINGS ####
// ##############################################################
// 0 - backlight [exact hour - 24h]
// 1 - relayTimer [ms] [default: 10min (600000)]
// 2 - localMeasureInterval [ms] [default: 3s (3000ms)]
// 3 - remoteMeasureInterval [ms] [default: 30min (1800000ms)]
// 4 - wateringRoutineStartTime [exact hour - 24h]
// 5 - wateringRoutineEndTime [exact hour - 24h]
// 6 - wateringRoutinePumpDuration [default: 5 min (900000)]
// 7 - wateringRoutineInterval [default: 30 min (900000)]
// 8 - moistureSensorSetPoint [default: 15 u.m. from 1 to 1024]
// ##############################################################
long settings[9] = {22, 60000, 3000, 1800000, 9, 18, 300000 , 1800000, 20};
String settingsName[9] = {
  "backlight",
  "relayTimer",
  "localMeasureInterval",
  "remoteMeasureInterval",
  "wateringRoutineStartTime",
  "wateringRoutineEndTime",
  "wateringRoutinePumpDuration",
  "wateringRoutineInterval",
  "moistureSensorSetPoint"
};

// #### DHT VARIABLES ####
float internalTemperature = 0;
float internalHumidity = 0;

// #### MUTATION FLAGS ####
int websocketReconnectionRetries = 0;
bool withoutUserWiFiConfig; // flag to track auto ESP connection. without config means the user should configure the network
bool settingsTriggered = false;
bool wateringRoutineMode = false;
bool moistureAutoMode = false;
bool manualRelayAction = false;
bool autoRelayAction = false;
bool buttonLastState = false;
bool alexaCommand = false;
bool bypassWifi =  false;
bool sendStatusToServer = false;
bool disconnectedFromServer = false;

int hours;
int minutes;

// #### DHT PINS ####
// DHT dht(DHT3_PIN, DHT_TYPE);
// DHT dht2(DHT2_PIN, DHT_TYPE);
// DHT dht3(DHT_PIN, DHT_TYPE);

// #### SERVER SETTINGS ####
// Credentials
const char *ssidServer = "BeThere Access Point";
const char *passwordServer = "welcome123";
// Start server
ESP8266WebServer server(80);
// Server settings
IPAddress ap_local_IP(192, 168, 1, 105); //ESP static IP address
IPAddress ap_gateway(192, 168, 15, 1); //IP Address of your WiFi Router (Gateway)
IPAddress ap_subnet(255, 255, 255, 0); //Subnet mask
IPAddress dns(8,8,8,8); //DNS (could be 8,8,8,8 for google dns or any other DNS

// #### FUNCTIONS ####
// #### GENERAL USE ####
void debuggerLog(String m) {
 if(ENABLE_DEBUGGER_LOGS) {
  Serial.println(m);
 }
}

void printToLcd(int col, int row, String stringToPrint) {
  if(!ENABLE_LCD) {
   return;
  }

  lcd.setCursor(col, row);
  lcd.print(stringToPrint);
}

void clearLcd () {
  if(!ENABLE_LCD) {
   return;
  }
  lcd.clear();
}

// ##### CONFIGS ####
void printConfigs() {
  Serial.println("\n####################################");
  Serial.println("SERIAL_KEY_PROD: " + String(SERIAL_KEY_PROD));
  Serial.println("ENABLE_RELAY_LOW: " + String(ENABLE_RELAY_LOW));
  Serial.println("ENABLE_LCD: " + String(ENABLE_LCD));
  Serial.println("ENABLE_RELAY_PUSH_BUTTON: " + String(ENABLE_RELAY_PUSH_BUTTON));
  Serial.println("RELAY_PIN: " + String(RELAY_PIN));
  Serial.println("PUSH_BUTTON_PIN: " + String(PUSH_BUTTON_PIN));
  Serial.println("TS_CHANNEL_NUM: " + String(TS_CHANNEL_NUM));
  Serial.println("TS_WRITE_API_KEY: " + String(TS_WRITE_API_KEY));
  Serial.println("ENABLE_ANALOG_SENSOR: " + String(ENABLE_ANALOG_SENSOR));
  Serial.println("ANALOG_SENSOR_KEY: " + String(ANALOG_SENSOR_KEY));
  Serial.println("####################################");
}

void setConfig() {
  Serial.println("\n####################################");
  Serial.print("CONFIGS FOR ");
  Serial.print(BeThere.getSerialKey(SHORT_SERIAL_KEY));
  Serial.println("####################################");
  // Serial.println(BeThere.getConfig(SHORT_SERIAL_KEY));

  // parse JSON from lib
  DeserializationError error = deserializeJson(doc, BeThere.getConfig(SHORT_SERIAL_KEY));
  
  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }
  
  // assign values from json to global variables
  ENABLE_RELAY_LOW = doc["ENABLE_RELAY_LOW"];
  ENABLE_RELAY_PUSH_BUTTON = doc["ENABLE_RELAY_PUSH_BUTTON"];
  ENABLE_ANALOG_SENSOR = doc["ENABLE_ANALOG_SENSOR"];
  if(ENABLE_ANALOG_SENSOR) {
    strcpy(ANALOG_SENSOR_KEY, doc["ANALOG_SENSOR_KEY"]);
  }
  ENABLE_LCD = doc["ENABLE_LCD"];
  RELAY_PIN = doc["RELAY_PIN"];
  if(ENABLE_RELAY_PUSH_BUTTON) {
    PUSH_BUTTON_PIN = doc["PUSH_BUTTON_PIN"];
  }
  TS_CHANNEL_NUM = doc["TS_CHANNEL_NUM"];
  strcpy(TS_WRITE_API_KEY, doc["TS_WRITE_API_KEY"]);
  strcpy(SSID_PROD, doc["SSID"]);
  strcpy(SSID_PASSWORD_PROD, doc["PASSWORD"]);
  if(!ENABLE_DEV_MODE) {
    strcpy(SERIAL_KEY_PROD, doc["SERIAL_KEY_PROD"]);
  }

  // print configured settings
  printConfigs();
}

// #### WIFI ####
// Check connection status while connecting
void verifyConnection() {
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("...connecting!");
    ESP.wdtFeed();
  }
  Serial.println("BeThere connected");
  withoutUserWiFiConfig = false;
}

void handleWithoutWiFiConfig() {
  while (withoutUserWiFiConfig) {
    server.handleClient();
    Serial.println("...waiting for client");
    printToLcd(0, 0, "Without connection");
    printToLcd(0, 1, "Search WiFi BeThere");

    if (bypassWifi) {
     clearLcd();
     printToLcd(0, 0, "Starting!");
     delay(1500);
     clearLcd();
     withoutUserWiFiConfig = false;
    };
    ESP.wdtFeed();
  }
}

// WiFi Initialization
// can receive custom credentials if needs to call function as a callback
void initWifi(String ssid = "noop", String password = "noop") {
  Serial.println(ssid);
  Serial.println(password);
  if(ENABLE_ACCESS_POINT) {
    WiFi.begin(ssid, password);
  } else {
    WiFi.mode(WIFI_STA);
     ENABLE_DEV_MODE || USE_LOCAL_NETWORK
      ? WiFi.begin(SSID_DEV, SSID_PASSWORD_DEV) 
      : WiFi.begin(SSID_PROD, SSID_PASSWORD_PROD);
  }
  verifyConnection();
}

void recoverWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Connection lost!");
    printToLcd(15, 0, "*");
    WiFi.disconnect();
    delay(200);
    WiFi.reconnect();
    delay(500);
    yield();
    ESP.wdtFeed();
  } else {
    printToLcd(15, 0, " ");
  }  
}

// #### LOCAL SERVER FUNCTIONS ####
void handleResetConfig() {
  ESP.eraseConfig();
  server.send(200, "text/html", BeThere.getAccessPointPage());
  ESP.reset();
}

void handleBypassWifi() {
  bypassWifi = true;
}

// Dispaly values and write to memmory
void handleSubmit() {
  clearLcd();
  String response = "<p>The following configuration was saved with success.";
  response += "<br>";
  response += "network name:";
  response += server.arg("ssid");
  response += "<br>";
  response += "password:";
  response += server.arg("Password");
  response += "<br>";
  response += "</p><br>";
  response += "<h2><a href=\"/\">go back to main screen</a></h2><br>";

  server.send(200, "text/html", response);

  initWifi(server.arg("ssid"), server.arg("Password"));
  clearLcd();
}

void handleRoot() {
  if (server.hasArg("ssid") && server.hasArg("Password")) { 
    handleSubmit();
  } else {
    server.send(200, "text/html", BeThere.getAccessPointPage());
  }
}

void initAccessPoint() {
  WiFi.disconnect();
  WiFi.softAPConfig(ap_local_IP, ap_gateway, ap_subnet);
  WiFi.softAP(ssidServer, passwordServer);
  // webserver routes
  server.on("/", handleRoot);
  server.on("/reset", handleResetConfig);
  server.on("/without-wifi" , handleBypassWifi);
  server.begin();
  Serial.println("HTTP server started");
  delay(500);

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("...connected using last credentials!");
    withoutUserWiFiConfig = false;
    ESP.wdtFeed();
  } else {
    withoutUserWiFiConfig = true;
  }
}

// #### WEBSOCKET FUNCTIONS ####

void sendSerialKey () {
  String onOpenMessage = "BeThere is alive";
  String marker = "$";
  if(ENABLE_DEV_MODE) {
    wsclient.send(onOpenMessage + marker + SERIAL_KEY_DEV);
  } else {
    wsclient.send(onOpenMessage + marker + SERIAL_KEY_PROD);
  }
}

// WEBSOCKET EVENTS CALLBACK
void onEventsCallback(WebsocketsEvent event, String data) {
  if (event == WebsocketsEvent::ConnectionOpened) {
    Serial.println("Connnection Opened");
    pongTimer = millis();
    sendSerialKey();
  } else if (event == WebsocketsEvent::ConnectionClosed) {
    Serial.println("Connnection Closed");
    disconnectedFromServer = true;
    // pongTimer = 0;
  } else if (event == WebsocketsEvent::GotPing) {
    pongTimer = millis();
  } else if (event == WebsocketsEvent::GotPong) {
    Serial.println("Got a Pong!");
  }
}

// #### IO FUNCTIONS ####
void writeRelayState(bool state) {
  bool stateToWrite = ENABLE_RELAY_LOW ? state : !state;
  Serial.print("==================================");
  Serial.println(stateToWrite);
  digitalWrite(RELAY_PIN, stateToWrite);
}

void turnOffRelay () {
  writeRelayState(HIGH);
  beginRelayTimer = 0;
  wsclient.send("MP0");
  manualRelayAction = false;
}

void resetRelayState() {
  // to make sure relay is off in case of a reset
  wsclient.send("RESET_RELAY_STATE");
  
  writeRelayState(HIGH);
  wsclient.send("feedback#WR_PUMP_OFF");
  // reset watering routine timer if relay is triggered to off when in routine mode
  // beginWateringRoutineTimer = millis();
  beginRelayTimer = 0;
  wsclient.send("feedback#MP0");
  manualRelayAction = false;
}

void startManualRelayAction() {
  writeRelayState(LOW);
  wsclient.send("MP1"); // TODO: need to add MP1#feedback here to differ from button and change constant in the BE
  beginRelayTimer = millis();
  manualRelayAction = true;
  Serial.println("start manual relay");
}

void stopAutoRelayAction() {
  writeRelayState(HIGH);
  wsclient.send("WR_PUMP_OFF");
  beginRelayTimer = 0;
  beginWateringRoutineTimer = millis(); // reset watering timer for each cycle
  autoRelayAction = false;
}

void startAutoRelayAction() {
  autoRelayAction = true;
  wsclient.send("WR_PUMP_ON");
  writeRelayState(LOW);
  beginRelayTimer = millis(); // start pump timer
  beginWateringRoutineTimer = millis(); //reset timer after  a cicle
}

void handleApplyCommand (String message) {
  // get time from server message
  if (message.indexOf("time") != -1) {
    hours = message.substring(5, 7).toInt();
    minutes = message.substring(8, 10).toInt();
  }

  if (message == "SETTINGS") {
    settingsTriggered = true;
  }

  if (message == "GET_STATUS_ON") {
    sendStatusToServer = true;
  }

  if (message == "GET_STATUS_OFF") {
    sendStatusToServer = false;
  }
  
  if (message == "RESET_ESP") {
    ESP.restart();
  }

  // WATERING ROUTINE
  if (message == "WR_ON") {
    wateringRoutineMode = true;
    // if automation counter is equal to 0, it means it was disabled. Start watering routine timer.
    if(beginWateringRoutineTimer == 0 && !disconnectedFromServer) {
      wsclient.send("feedback#WR_ON");
      beginWateringRoutineTimer = millis();
    }
  }

  if(message == "WR_MS_ON") {
    moistureAutoMode = true;
  }

  if(message == "WR_MS_OFF") {
    moistureAutoMode = false;
  }

  if (message == "WR_OFF") {
    wateringRoutineMode = false;
    wsclient.send("feedback#WR_OFF");
    // assign timer to 0 to stop counting
    beginWateringRoutineTimer = 0;
  }

  if (message == "WR_PUMP_OFF") {
    writeRelayState(HIGH);
    wsclient.send("feedback#WR_PUMP_OFF");
    // reset watering routine timer if relay is triggered to off when in routine mode
    beginWateringRoutineTimer = millis();
    beginRelayTimer = 0;
  }

  // CHANGE RELAY STATUS
  if (message == "MP0") {
    writeRelayState(HIGH);
    wsclient.send("feedback#MP0");
    beginRelayTimer = 0;
    manualRelayAction = false;

    if(wateringRoutineMode) { // should add autoRelayAction ?
      beginWateringRoutineTimer = millis();  
    }
  }

  if (message == "MP1") {
    startManualRelayAction();
  }  
}

void handleWebsocketConnection () {
  if (wsclient.available()) {
    printToLcd(15, 1, " ");
    if ((millis() - pongTimer) > 42000) {
      Serial.println("no response, close connection");
      wsclient.close();
    }
    wsclient.poll();
    ESP.wdtFeed();
  } else {
    Serial.println("reconnecting to websocket server...");
    printToLcd(15, 1, "*");
    websocketReconnectionRetries++;
    bool connected = wsclient.connect(BeThere.getServerUri(ENABLE_DEV_MODE, USE_LOCAL_HOST));
    if (connected) {
      // reset retries
      websocketReconnectionRetries = 0;
      // sendSerialKey();
      pongTimer = millis();
    }
    if (websocketReconnectionRetries > RECONNECTION_RETRIES) {
      ESP.restart();
    }
  }
}

// #### THINGSPEAK ####
void sendFieldsToThingSpeak(
  float internalHumidity,
  float internalTemperature,
  float externalHumidity,
  float externalTemperature
){
  // ThingSpeak - Set fields
  ThingSpeak.setField(3, internalHumidity);
  ThingSpeak.setField(4, internalTemperature);
  ThingSpeak.setField(5, externalHumidity);
  ThingSpeak.setField(6, externalTemperature);

  // ThingSpeak - Write fields
  int response;
  if(ENABLE_DEV_MODE) {
    response = ThingSpeak.writeFields(TS_CHANNEL_NUM_DEV, TS_WRITE_API_KEY_DEV);
  } else {
    response = ThingSpeak.writeFields(TS_CHANNEL_NUM, TS_WRITE_API_KEY);
  }
  client.flush();
  // Check status response
  if (response == 200) {
    Serial.println("Data sent with success!");
    beginSendMeasureTimer = millis();
  } else {
    Serial.println("Coneection Error: " + String(response));
  }
}

void setup() {
  // Begin serial
  Serial.begin(115200);
  while (!Serial); // Waiting for Serial Monitor

  // Begin wire
  Wire.begin(); // Wire communication begin

  setConfig();

  // Begin wifi
  if(!ENABLE_ACCESS_POINT) {
    initWifi();
  } else {
    initAccessPoint();
  }

  printConfigs();
  // connect with websocket server
  String serverUri = BeThere.getServerUri(ENABLE_DEV_MODE, USE_LOCAL_HOST);
  bool connected = wsclient.connect(serverUri);
  if (connected) {
    Serial.print("Connected with BeThere websocket server:");
    Serial.println(serverUri);
    sendSerialKey();
    resetRelayState(); 
  } else {
    Serial.println("Not Connected!");
  }

  // begin DHT sensors
  // dht.begin();
  // dht2.begin();

  // websocket events
  wsclient.onEvent(onEventsCallback);

  // callback where the messages are received
  wsclient.onMessage([&](WebsocketsMessage message) {
    pongTimer = millis();
    String messageFromRemote = message.data();
    Serial.print("Message from server: ");
    Serial.println(message.data());
    // SETTINGS triggered. The default settings array will be overwriten
    if (settingsTriggered) {
      if(wateringRoutineMode && !disconnectedFromServer) { // reset timer if user send new configs and it is not a disconnect state
        Serial.println("resetou timer de automation");
        beginWateringRoutineTimer = millis();
      }
      char commandArray[messageFromRemote.length()];
      messageFromRemote.toCharArray(commandArray, 50);
      char *parsedSettings;
      parsedSettings = strtok(commandArray, ",");
      int cont = 0;
      
      while (parsedSettings != NULL) {
        long int numb = atol(parsedSettings);
        wsclient.send(String(settingsName[cont]) + ":" + String(numb));
        settings[cont] = numb; // *60 min*1000ms
        cont++;
        parsedSettings = strtok(NULL, ",");
        yield();
      }
      settingsTriggered = false;
      // to check received settings
      Serial.println("######################");
      for (int i = 0; i < 9; i++)
      {
        Serial.println(settings[i]);
      }
      Serial.println("######################");
      disconnectedFromServer = false;
    }

    handleApplyCommand(messageFromRemote);

    int currentPumpStatus = digitalRead(RELAY_PIN);
    Serial.print("current pump status");
    Serial.print(currentPumpStatus);
    // overwrite the current status in case of internet failure
    // using digital write to maintain the status withou inversion ENABLE_RELAY_LOW
    digitalWrite(RELAY_PIN, currentPumpStatus); 
    yield();
  });
  
  // initial state - relay
  pinMode(RELAY_PIN, OUTPUT);
  writeRelayState(HIGH); // default logics - relay off if the state is HIGH

  if(ENABLE_RELAY_PUSH_BUTTON) {
    pinMode(PUSH_BUTTON_PIN, INPUT_PULLUP); 
  }

  if(!ENABLE_ANALOG_SENSOR) {
    // Init SHT20 Sensor
    sht20External.initSHT20(); 
    delay(100);
    sht20External.checkSHT20();
    delay(100);
    sht20Internal.initSHT20(); 
    delay(100);
    sht20Internal.checkSHT20();
  }

  ThingSpeak.begin(client);

  // initialize LCD
  if(ENABLE_LCD) {
    lcd.begin(16, 2);
    lcd.init();
    lcd.backlight();
    printToLcd(0,0,"BeThere started");
    delay(1000);
    clearLcd();
  }

  // begin measure timer
  beginSendMeasureTimer = millis();
}

void loop() {
  if (ENABLE_ACCESS_POINT) {
    server.handleClient();
  }

  recoverWiFiConnection();
  handleWebsocketConnection();

  // if manual relay action is triggered and time started
  if(manualRelayAction && beginRelayTimer > 0) {
    // Serial.print("Pump on time:");
    // Serial.println((millis() - beginRelayTimer)/60000);
    if ((millis() - beginRelayTimer) > settings[1]) {
      writeRelayState(HIGH);
      beginRelayTimer = 0;
      wsclient.send("MP0");
      Serial.println("Pump finished the work!");
      manualRelayAction = false;
    }
  }

  // when watering routine mode is active, need to check if the time matches to run the logics
  if (wateringRoutineMode) {
    // Check time configured in settings and start watering routine
    if (!moistureAutoMode && hours >= settings[4] && hours < settings[5]) {
      Serial.print("Time to set auto:");
      Serial.print(millis() - beginWateringRoutineTimer);
      Serial.print(" min:");
      Serial.println((millis() - beginWateringRoutineTimer)/60000); 

      // only enter below once - when the relay is not up
      if ((millis() - beginWateringRoutineTimer > settings[7]) && beginRelayTimer == 0) { // check if the interval has passed;
        Serial.println("Auto watering activated");
        startAutoRelayAction();
      }
    }

    // check if is not a relay timer triggered manually
    if(!manualRelayAction && autoRelayAction) {
      // check if the time has passed using the settings to finish work and write states
      if (millis() - beginRelayTimer > settings[6]) {
        stopAutoRelayAction();
        Serial.println("Auto Watering - Pump finished the work!");
      }
    }

    if(!manualRelayAction && moistureAutoMode) {
      int sensorValue = analogRead(ANALOG_PIN);

      if(!autoRelayAction && (settings[8] > sensorValue)) {
        startAutoRelayAction();
      } else {
        // stop moisture routine
      }
    }
  }

//  float internalHumidity = dht2.readHumidity();
//  float internalTemperature = dht2.readTemperature();
//  float externalHumidity = dht.readHumidity();
//  float externalTemperature = dht.readTemperature();

  if(!ENABLE_ANALOG_SENSOR) {
    float internalHumidity = sht20Internal.readHumidity();
    float internalTemperature = sht20Internal.readTemperature();
    float externalHumidity = sht20External.readHumidity();
    float externalTemperature = sht20External.readTemperature();
  
    printToLcd(0, 0, "H:");
  
    if (isnan(internalHumidity)) {
      printToLcd(2, 0, "--.-");
    } else {
      printToLcd(2, 0, String(internalHumidity));
      printToLcd(6, 0, " ");
    }
    
    printToLcd(0, 1, "T:");
  
    if (isnan(internalTemperature)) {
      printToLcd(2, 1, "--.-");
    } else {
      printToLcd(2, 1, String(internalTemperature));
    }
    printToLcd(7, 0 , "H2:");
  
    if (isnan(externalHumidity)) {
      printToLcd(10, 0, "--.-");
    } else {
      printToLcd(10, 0, String(externalHumidity));
    }
    
    printToLcd(7, 1 , "T2:");
  
    if (isnan(externalTemperature)) {
      printToLcd(10, 1, "--.-");
    } else {
      printToLcd(10, 1, String(externalTemperature));
    }
    if (millis() - beginSendMeasureTimer > settings[3]) {
      sendFieldsToThingSpeak(
        internalHumidity,
        internalTemperature,
        externalHumidity,
        externalTemperature
      );
    }
  } else {
    if (millis() - beginSendMeasureTimer > settings[3]) {
      Serial.println("Sending data...");
      int sensorValue = analogRead(ANALOG_PIN);
      measures["value"] = sensorValue;
      measures["origin"] = ANALOG_SENSOR_KEY;
      measures["measureName"] = "moisture";
      String serializedDoc;
      serializeJson(measures, serializedDoc);
      String measureAndInfoJson = String("WRITE_MEASURE$") + serializedDoc;

      beginSendMeasureTimer = millis();
      wsclient.send(measureAndInfoJson);
    }
  }
  

  if(sendStatusToServer) {
    String statusString = "";
    int currentRelayStatus = digitalRead(RELAY_PIN);
    // overwrite the current status in case of internet failure
    statusString = String("Watering mode:") +  String(wateringRoutineMode) + "" +
                   String("Relay:") + String(currentRelayStatus) + "" + 
                   String("Manual action:") + String(manualRelayAction) + "" + 
                   String(autoRelayAction);
    Serial.println(statusString);
    wsclient.send(statusString);
  }

  if(ENABLE_RELAY_PUSH_BUTTON) {
    bool buttonState = digitalRead(PUSH_BUTTON_PIN);
    if(buttonLastState == 0 && buttonState == 1) {
      if(manualRelayAction) {
        buttonLastState = false;
        turnOffRelay();
        delay(100);
      } else {
        Serial.println("#############################");
        startManualRelayAction();
      }
    }
    buttonLastState = buttonState;
  }
}
