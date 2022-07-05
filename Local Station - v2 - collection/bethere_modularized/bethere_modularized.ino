#include <Adafruit_Sensor.h>
#include <ArduinoJson.h>
#include <DHT.h>
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
#define SHORT_SERIAL_KEY D_35U2I
// #define SHORT_SERIAL_KEY D_M5YZ5

// #### COMMANDS ####
#define RELAY1_ON "MP1"
#define RELAY1_OFF "MP0"
#define RESET_ESP "RESET_ESP"
#define DISCONNECTED "DISCONNECTED"
#define CONNECTED "CONNECTED"
#define SETTINGS "SETTINGS"

// #### STATIC CONFIGS ####
#define USE_PROD_TEST_SERIAL false
#define ENABLE_DEV_MODE false
#define ENABLE_ACCESS_POINT false
#define ENABLE_DEBUGGER_LOGS true
#define RECONNECTION_RETRIES 8

// #### DHT PINS ####
// #define DHT_PIN 12 // d6
// #define DHT2_PIN 13 // d7
#define DHT3_PIN 14 // d5
#define DHT_TYPE DHT22

// #### CONFIGS FROM SERIAL - DEFAULT VALUES ####
bool ENABLE_RELAY_LOW = false;
bool ENABLE_RELAY_PUSH_BUTTON = false;
bool ENABLE_ANALOG_SENSOR = false;
int RELAY_PIN = 13; // d7
int PUSH_BUTTON_PIN = 10;
int ANALOG_PIN = A0;

// #### OBJECT DECLARATIONS ####
using namespace websockets;
WiFiClient client;
WebsocketsClient wsclient;
BeThere BeThere;
// DFRobot_SHT20 sht20;
LiquidCrystal_I2C lcd(0x27, 16, 2);
StaticJsonDocument<200> doc;

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
char SSID_PROD[] = {"Romagnolo 2.4G"};
char SSID_PASSWORD_PROD[] = {"melzinha123"};

// WiFi Credentials - DEV
//char SSID_DEV[] = "Romagnolo 2.4G";
//char SSID_PASSWORD_DEV[] = "melzinha123";
char SSID_DEV[] = "Satan`s Connection";
char SSID_PASSWORD_DEV[] = "tininha157";

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
  "moistureSensorSetPoint"};

// #### DHT VARIABLES ####
float internalTemperature = 0;
float internalHumidity = 0;

// #### MUTATION FLAGS ####
int websocketReconnectionRetries = 0;
bool withoutUserWiFiConfig; // flag to track auto ESP connection. without config means the user should configure the network
bool settingsTriggered = false;
bool wateringRoutineMode = false;
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
DHT dht(DHT3_PIN, DHT_TYPE);
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
// ##### CONFIGS ####
void printConfigs() {
  Serial.println("\n#############");
  Serial.println("ENABLE_RELAY_LOW: " + String(ENABLE_RELAY_LOW));
  Serial.println("ENABLE_RELAY_PUSH_BUTTON: " + String(ENABLE_RELAY_PUSH_BUTTON));
  Serial.println("SERIAL_KEY_PROD: " + String(SERIAL_KEY_PROD));
  Serial.println("RELAY_PIN: " + String(RELAY_PIN));
  Serial.println("PUSH_BUTTON_PIN: " + String(PUSH_BUTTON_PIN));
  Serial.println("#############");
}

void setConfig() {
  Serial.println("\n####################################");
  Serial.print("CONFIGS FOR ");
  Serial.print(BeThere.getSerialKey(SHORT_SERIAL_KEY));
  Serial.println("\n####################################");
  // Serial.println(BeThere.getConfig(D_M5YZ5));

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
  RELAY_PIN = doc["RELAY_PIN"];
  if(ENABLE_RELAY_PUSH_BUTTON) {
    PUSH_BUTTON_PIN = doc["PUSH_BUTTON_PIN"];
  }
  strcpy(SSID_PROD, doc["SSID"]);
  strcpy(SSID_PASSWORD_PROD, doc["PASSWORD"]);
  strcpy(SERIAL_KEY_PROD, doc["SERIAL_KEY_PROD"]);

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
     lcd.setCursor(0, 0);
     lcd.print("Without connection");
     lcd.setCursor(0, 1);
     lcd.print("Search WiFi BeThere");

    if (bypassWifi) {
     lcd.clear();
     lcd.setCursor(0 , 0);
     lcd.print("Starting!");
     delay(1500);
     lcd.clear();
     withoutUserWiFiConfig = false;
    };
    ESP.wdtFeed();
  }
}

// WiFi Initialization
// can receive custom credentials if needs to call function as a callback
void initWifi(String ssid = "noop", String password = "noop") {
  if(ENABLE_ACCESS_POINT) {
    WiFi.begin(ssid, password);
  } else {
    WiFi.mode(WIFI_STA);
    ENABLE_DEV_MODE || USE_PROD_TEST_SERIAL 
      ? WiFi.begin(SSID_DEV, SSID_PASSWORD_DEV) 
      : WiFi.begin(SSID_PROD, SSID_PASSWORD_PROD);
  }
  verifyConnection();
}

void recoverWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Connection lost!");
    lcd.setCursor(15, 0);
    lcd.print("*");
    WiFi.disconnect();
    delay(200);
    WiFi.reconnect();
    delay(500);
    yield();
    ESP.wdtFeed();
  } else {
    lcd.setCursor(15, 0);
    lcd.print(" ");
  }  
}

void debuggerLog(String m) {
 if(ENABLE_DEBUGGER_LOGS) {
  Serial.println(m);
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
  lcd.clear();
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
  lcd.clear();
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
    if(USE_PROD_TEST_SERIAL) {
      wsclient.send(onOpenMessage + marker + SERIAL_KEY_PROD_TEST);
    } else {
      wsclient.send(onOpenMessage + marker + SERIAL_KEY_DEV);
    }
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
  wsclient.send("MP1");
  beginRelayTimer = millis();
  manualRelayAction = true;
  Serial.println("start manual relay");
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
    lcd.setCursor(15, 1);
    lcd.print(" ");
    if ((millis() - pongTimer) > 42000) {
      Serial.println("no response, close connection");
      wsclient.close();
    }
    wsclient.poll();
    ESP.wdtFeed();
  } else {
    Serial.println("reconnecting to websocket server...");
    lcd.setCursor(15, 1);
    lcd.print("*");
    websocketReconnectionRetries++;
    bool connected = wsclient.connect(BeThere.getServerUri(ENABLE_DEV_MODE, USE_PROD_TEST_SERIAL));
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
  String serverUri = BeThere.getServerUri(ENABLE_DEV_MODE, USE_PROD_TEST_SERIAL);
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
  dht.begin();
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
      for (int i = 0; i < 8; i++)
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
  writeRelayState(HIGH); // relay off

  if(ENABLE_RELAY_PUSH_BUTTON) {
    pinMode(PUSH_BUTTON_PIN, INPUT_PULLUP);
    // writeRelayState(LOW); 
  }
  // Init SHT20 Sensor
//  sht20.initSHT20(); 
//  delay(100);
//  sht20.checkSHT20();

  ThingSpeak.begin(client);

  // initialize LCD
  lcd.begin(16, 2);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  delay(500);
  lcd.print("BeThere started");
  delay(1000);
  lcd.setCursor(0, 0);
  lcd.clear();
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
    if (hours >= settings[4] && hours < settings[5]) {
      Serial.print("Time to set auto:");
      Serial.print(millis() - beginWateringRoutineTimer);
      Serial.print(" min:");
      Serial.println((millis() - beginWateringRoutineTimer)/60000); 

      // only enter below once - when the relay is not up
      if ((millis() - beginWateringRoutineTimer > settings[7]) && beginRelayTimer == 0) { // check if the interval has passed;
        Serial.println("Auto watering activated");
        autoRelayAction = true;
        wsclient.send("WR_PUMP_ON");
        writeRelayState(LOW);
        beginRelayTimer = millis(); // start pump timer
        beginWateringRoutineTimer = millis(); //reset timer after  a cicle
      }
    }

    // check if is not a relay timer triggered manually
    if(!manualRelayAction && autoRelayAction) {
      // check if the time has passed using the settings to finish work and write states
      if (millis() - beginRelayTimer > settings[6]) {
        writeRelayState(HIGH);
        wsclient.send("WR_PUMP_OFF");
        beginRelayTimer = 0;
        beginWateringRoutineTimer = millis(); // reset watering timer for each cycle
        autoRelayAction = false;
        Serial.println("Auto Watering - Pump finished the work!");
      }
    }
  }

//  float internalHumidity = dht2.readHumidity();
//  float internalTemperature = dht2.readTemperature();

  float externalHumidity = dht.readHumidity();
  float externalTemperature = dht.readTemperature();
  
  lcd.setCursor(0, 0);
  lcd.print("H:");
  lcd.setCursor(2, 0);

  if (isnan(internalHumidity)) {
    lcd.print("--.-");
  } else {
    lcd.print(internalHumidity, 1);
    lcd.setCursor(6, 0);
    lcd.print(" ");
  }

    lcd.setCursor(0 , 1);
    lcd.print("T:");
    lcd.setCursor(2 , 1);

  if (isnan(internalTemperature)) {
    lcd.print("--.-");
  } else {
    lcd.print(internalTemperature, 1);
  }

  // delay(200);

  lcd.setCursor(7, 0);
  lcd.print("H2:");
  lcd.setCursor(10, 0);

  if (isnan(externalHumidity)) {
    lcd.print("--.-");
  } else {
    lcd.print(externalHumidity, 1);
  }

  lcd.setCursor(7 , 1);
  lcd.print("T2:");
  lcd.setCursor(10 , 1);

  if (isnan(externalTemperature)) {
    lcd.print("--.-");
  } else {
    lcd.print(externalTemperature , 1);
  }

  if(ENABLE_ANALOG_SENSOR) {
    int sensorValue = analogRead(ANALOG_PIN);
  }
  
  if (millis() - beginSendMeasureTimer > settings[3]) {
    Serial.println("Sending data...");
    // ThingSpeak - Set fields
    ThingSpeak.setField(3, internalHumidity);
    ThingSpeak.setField(4, internalTemperature);
    ThingSpeak.setField(5, externalHumidity);
    ThingSpeak.setField(6, externalTemperature);

    // ThingSpeak - Write fields
    int response;
    if(ENABLE_DEV_MODE || USE_PROD_TEST_SERIAL) {
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
    delay(100);
  }
}