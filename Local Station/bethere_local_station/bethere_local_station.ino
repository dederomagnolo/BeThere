#include <Adafruit_Sensor.h>
#include <string.h>
#include <DHT.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <Wire.h>
#include "SPI.h".
#include <LiquidCrystal_I2C.h>
#include <ThingSpeak.h>
#include <WiFiUdp.h>
#include <ArduinoWebsockets.h>
#include <ESP8266WebServer.h>

// #### PINS DEFINITION ####
const int pinDHT = 12;
const int pinDHT2 = 13;
const int pinDHT3 = 14;
const int typeDHT = DHT22;
const int pumpInputRelay = 16;

// #### GLOBAL VARIABLES ####
// Timers
unsigned long beginSendMeasureTimer = 0;
unsigned long beginPumpTimer = 0;
unsigned long pongTimer = 0;
unsigned long beginWateringRoutineTimer = 0;
unsigned long lcdTimer = 0;
unsigned long pumpMaxInterval = 1200000; // 20 minutes
unsigned long maxPongInterval = 42000; // 40 secs
// unsigned long lcdTimerMaxInterval = 60000;
// Settings Array
// 0 - backlight [exact hour - 24h]
// 1 - pumpTimer [ms] [default: 10min (600000)]
// 2 - localMeasureInterval [ms] [default: 3s (3000ms)]
// 3 - remoteMeasureInterval [ms] [default: 3min (180000ms)]
// 4 - wateringRoutineStartTime [exact hour - 24h]
// 5 - wateringRoutineEndTimer [exact hour - 24h]
// 6 - wateringRoutinePumpDuration [default: 5 min (900000)]
// 7 - wateringRoutineInterval [default: 30 min (900000)]
unsigned long settings[8] = {22, 1200000, 3000, 1800000, 9, 18, 300000 , 1800000};
float internalTemperature = 0;
float internalHumidity = 0;
// Flags
int websocketReconnectionRetries = 0;
int pumpFlag = 0;
bool withoutConfig; // flag to track auto ESP connection. without config means the user should configure the network
bool settingsOn = false;
bool wateringRoutineMode = false;
bool manualPump = false;
// Configure code
bool bypassWifi = false;
bool enableAccessPoint = false;
bool devMode = true;

// DHT PINS
DHT dht(pinDHT, typeDHT);
DHT dht2(pinDHT2, typeDHT);
DHT dht3(pinDHT3, typeDHT);

// #### DEVICE_SETTINGS ####
// WiFi Server - Setup variables
const char *ssidServer = "BeThere Access Point";
const char *passwordServer = "welcome123";

// Network credentials - Hardcoded connection
char ssid[] = "Satan`s Connection";
char password[] = "tininha157";
// char ssid[] = "iPhone de Débora";
// char password[] = "texas123";
// char ssid[] = "Cogumelos Sao Carlos";
// char password[] = "cogu2409";

// Device serial key - PROD
// const char *serialKey = "35U2I-MAQOO-EXQX5-U43PI";

// Device serial key - TEST
const char *serialKey = "A0CAA-DN6PV-6U2OD-NPY1Q";

// Thingspeak credentials - PROD
//unsigned long myChannelNumber = 695672;
//const char * myWriteAPIKey = "ZY113X3ZSZG96YC8";

// Thingspeak credentials - TEST
unsigned long myChannelNumber = 700837;
const char * myWriteAPIKey = "EZWNLFRNU5LW6XKU";

// websocket infos
const char* websocketServerHost = "https://bethere-be.herokuapp.com/";
const char* websocketServerHostLocal = "http://192.168.0.12";
const char* websocketServerPort = "8080";

// #### OBJECT DECLARATIONS ####
using namespace websockets;
WiFiClient client;
WebsocketsClient wsclient;
LiquidCrystal_I2C lcd(0x27, 16, 2);

// #### SERVER SETTINGS ####
// Start server
ESP8266WebServer server(80);
// Server settings
IPAddress ap_local_IP(192, 168, 1, 1);
IPAddress ap_gateway(192, 168, 1, 254);
IPAddress ap_subnet(255, 255, 255, 0);
int hours;
int minutes;

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

void onEventsCallback(WebsocketsEvent event, String data) {
  if (event == WebsocketsEvent::ConnectionOpened) {
    Serial.println("Connnection Opened");
    pongTimer = millis();
  } else if (event == WebsocketsEvent::ConnectionClosed) {
    Serial.println("Connnection Closed");
  } else if (event == WebsocketsEvent::GotPing) {
    Serial.println("pong timer started");
    pongTimer = millis();
    Serial.println("Got a Ping!");
  } else if (event == WebsocketsEvent::GotPong) {
    Serial.println("Got a Pong!");
  }
}

void setup() {
  // begin serial port
  Serial.begin(115200);
  Wire.begin(); // Wire communication begin
  while (!Serial); // Waiting for Serial Monitor

  // start server for access point
  if (enableAccessPoint) {
    WiFi.softAPConfig(ap_local_IP, ap_gateway, ap_subnet);
    WiFi.softAP(ssidServer, passwordServer);

    // webserver routes
    server.on("/", handleRoot);
    server.on("/reset", handleResetConfig);
    server.on("/without-wifi" , handleBypassWifi);
    server.begin();
    Serial.println("HTTP server started");
    WiFi.softAPConfig(ap_local_IP, ap_gateway, ap_subnet);
  }

  // erase every esp config before start
  // ESP.eraseConfig();

  // begin DHT sensors
  dht.begin();
  dht2.begin();
  dht3.begin();

  // initialize LCD
  lcd.begin(16, 2);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  delay(500);
  lcd.print("BeThere started");
  delay(500);
  lcd.setCursor(0, 0);
  lcd.clear();

  // begin wifi and try to connect - BYPASS ACCESS POINT
  if (!enableAccessPoint) {
    withoutConfig = false;
    initWifi();
  }

  if (enableAccessPoint) {
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("...connected using last credentials!");
      withoutConfig = false;
      ESP.wdtFeed();
    } else {
      withoutConfig = true;
    }
  } else {
    // begin wifi and try to connect
    withoutConfig = false;
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.println("...connecting!");
      yield();
      ESP.wdtFeed();
    }
    Serial.println("BeThere connected! :D");
  }

  // connect with websocket server
  bool connected = wsclient.connect(getServerUri());;
  if (connected) {
    Serial.println("Connected with BeThere websocket server!");
    wsclient.send("BeThere is alive");
    wsclient.send(String("$S") + serialKey);
  } else {
    Serial.println("Not Connected!");
  }

  // initialize output for relay and put it high
  pinMode(pumpInputRelay, OUTPUT);
  digitalWrite(pumpInputRelay, HIGH); //bomba desligada

  ThingSpeak.begin(client);
  delay(500);

  // websocket events
  wsclient.onEvent(onEventsCallback);

  // callback where the messages are received
  wsclient.onMessage([&](WebsocketsMessage message) {
    pongTimer = millis();
    String messageFromRemote = message.data();
    Serial.print("Message from server: ");
    Serial.println(message.data());

    // SETTINGS triggered. The default settings array will be overwriten
    // backlight, pumpTimer, localMeasureInterval, remoteMeasureInterval, monitoringMinLimit, monitoringMaxLimit
    if (settingsOn) {
      char commandArray[messageFromRemote.length()];
      messageFromRemote.toCharArray(commandArray, 50);
      char *parsedSettings;
      parsedSettings = strtok(commandArray, ",");
      int cont = 0;

      while ( parsedSettings != NULL ) {
        long int numb = atol(parsedSettings);
        wsclient.send(String("Settings received:") + String(numb));
        settings[cont] = numb; // *60 min*1000ms
        cont++;
        parsedSettings = strtok(NULL, ",");
        yield();
      }
      settingsOn = false;
      // to check received settings
            Serial.println("######################");
            for (int i = 0; i < 8; i++)
            {
              Serial.println(settings[i]);
            }
    }

    if (messageFromRemote.indexOf("time") != -1) {
      hours = messageFromRemote.substring(5, 7).toInt();
      minutes = messageFromRemote.substring(8, 10).toInt();
    }

    if (messageFromRemote == "SETTINGS") {
      settingsOn = true;
    }

    if (messageFromRemote == "RESET_ESP") {
      ESP.restart();
    }

    // LCD
    if (messageFromRemote == "LCD_ON") {
      lcdTimer = millis();
      lcd.backlight();
    }

    if (messageFromRemote == "LCD_OFF") {
      if (lcdTimer > 0) {
        lcdTimer = 0;
      }
      lcd.noBacklight();
    }

    // WATERING ROUTINE
    if (messageFromRemote == "WR_ON") {
      wateringRoutineMode = true;
      beginWateringRoutineTimer = millis();
    }

    if (messageFromRemote == "WR_OFF") {
      wateringRoutineMode = false;
      beginWateringRoutineTimer = 0;
    }

    if (messageFromRemote == "WR_PUMP_OFF") {
      digitalWrite(pumpInputRelay, HIGH);
      beginWateringRoutineTimer = millis();
    }

    // CHANGE PUMP STATUS
    if (messageFromRemote == "MP0") {
      digitalWrite(pumpInputRelay, HIGH);
      beginPumpTimer = 0;
      manualPump = false;
    }

    if (messageFromRemote == "MP1") {
      digitalWrite(pumpInputRelay, LOW);
      beginPumpTimer = millis();
      manualPump = true;
    }

    String statusString = "";
    int currentPumpStatus = digitalRead(pumpInputRelay);
    // overwrite the current status in case of internet failure
    digitalWrite(pumpInputRelay, currentPumpStatus);
    statusString = String("Watering mode:") +  String(wateringRoutineMode) + "" +
                   String("Pump:") + String(currentPumpStatus) + "" + String("Manual pump:") + String(manualPump);
    // Serial.println(statusString);
    wsclient.send(statusString);

    yield();
  });
  lcd.clear();
}

void loop() {
  if (enableAccessPoint) {
    server.handleClient();
  }

  //wifi recover
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

  // Waiting for connection
  while (withoutConfig) {
    server.handleClient();
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
      withoutConfig = false;
    };
    ESP.wdtFeed();
  }

  // connection with websocket recover
  if (wsclient.available()) {
    lcd.setCursor(15, 1);
    lcd.print(" ");
    if (millis() - pongTimer > maxPongInterval) {
      Serial.println("no response, close connection");
      wsclient.close();
      pongTimer = 0;
    }
    wsclient.poll();
    ESP.wdtFeed();
    yield();
  } else {
    Serial.println("reconnecting to websocket server...");
    lcd.setCursor(15, 1);
    lcd.print("*");
    websocketReconnectionRetries++;
    bool connected = wsclient.connect(getServerUri());
    if (connected) {
      websocketReconnectionRetries = 0;
      wsclient.send("BeThere is alive!");
      wsclient.send(String("$S") + serialKey);
      pongTimer = millis();
    }

    if (websocketReconnectionRetries > 8) {
      ESP.restart();
    }
  }

  // control pump from remote - manual mode
  if (manualPump && beginPumpTimer > 0) {
    Serial.println("Remote manual mode activated");
    wsclient.send("MP1");
    if (millis() - beginPumpTimer > settings[1]) {
      digitalWrite(pumpInputRelay, HIGH);
      beginPumpTimer = 0;
      wsclient.send("MP0");
      Serial.println("Pump finished the work!");
      manualPump = false;
    } else {
      Serial.println("Pump is on!");
    }
  }

  // control pump from remote - watering routine mode
  if (!manualPump && wateringRoutineMode && beginPumpTimer > 0) {
    Serial.println("Watering routine mode - WATERING ON");
    wsclient.send("WR_PUMP_ON");
    digitalWrite(pumpInputRelay, LOW);
    Serial.println(millis() - beginPumpTimer);
    if (millis() - beginPumpTimer > settings[6]) {
      digitalWrite(pumpInputRelay, HIGH);
      beginPumpTimer = 0;
      wsclient.send("WR_PUMP_OFF");
      Serial.println("Auto Watering - Pump finished the work!");
    } else {
      Serial.println("Auto Watering - Pump is on!");
    }
  }

  if (wateringRoutineMode) {
    // check start time and end time for configured watering routine
    if (hours > settings[4] && hours < settings[5]) {
      if (millis() - beginWateringRoutineTimer > settings[7]) { // check if the interval has passed;
        Serial.print("Start auto watering");
        Serial.println("########################################");
        beginPumpTimer = millis(); // start pump timer
        beginWateringRoutineTimer = millis();
      }
    }
  }

  // Read humidity and temperature from DHT22 sensors
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  float humidity2 = dht2.readHumidity();
  float temperature2 = dht2.readTemperature();
  float externalHumidity = dht3.readHumidity();
  float externalTemperature = dht3.readTemperature();
  //test
  float testHumidity = humidity;
  float testTemperature = temperature;

  // calculate the mean for internal sensor
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

  lcd.setCursor(0 , 1);
  lcd.print("T:");
  lcd.setCursor(2 , 1);

  if (isnan(internalTemperature)) {
    lcd.print("--.-");
  } else {
    lcd.print(internalTemperature, 1);
  }

  delay(200);

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

  //Just for debug - print in serial monitor
  //  Serial.println("H:" + String(humidity) + "T:" + String(temperature));
  //  Serial.println("H2:" + String(humidity2) + "T2:" + String(temperature2));
  //  Serial.println("H3:" + String(externalHumidity) + "T3:" + String(externalTemperature));
  //  Serial.println("Media T1 T2:" + String(internalTemperature));
  //  Serial.println("Media H1 H2:" + String(internalHumidity));

  // TESTING: SEND MEASURES TO WEBSOCKET SERVER
  //  String measures = "H1:" + String(internalHumidity) + "T1:" +String(internalTemperature) + "H2:" + String(externalHumidity) + "T2:" + String(externalTemperature);
  //  if(wsclient.available()) {
  //    wsclient.send(measures);
  //    yield();
  //  }

  if (millis() - beginSendMeasureTimer > settings[3]) {
    Serial.println("Sending data...");
    // ThingSpeak - Set fields
    ThingSpeak.setField(3, internalHumidity);
    ThingSpeak.setField(4, internalTemperature);
    ThingSpeak.setField(5, externalHumidity);
    ThingSpeak.setField(6, externalTemperature);
    ThingSpeak.setField(7, testHumidity);

    // ThingSpeak - Write fields
    int response = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);
    client.flush();
    // Check status response
    if (response == 200) {
      Serial.println("Data sent with success!");
      beginSendMeasureTimer = millis();

    } else {
      Serial.println("Coneection Error: " + String(response));
    }
  }
  yield();
  ESP.wdtFeed();
  delay(settings[2]);
}

String getServerUri () {
  if (devMode) {
    return String(websocketServerHostLocal) + ":" + String(websocketServerPort) + String("/?id=" + String(serialKey));
  } else {
    return String(websocketServerHost) + String("?id=" + String(serialKey));
  }
}

void handleRoot() {
  if (server.hasArg("ssid") && server.hasArg("Password")) { //If all form fields contain data call handelSubmit()
    handleSubmit();
  }
  else { //Redisplay the form
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

  WiFi.begin(server.arg("ssid"), server.arg("Password"));
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("...connecting!");
    ESP.wdtFeed();
  }
  Serial.println("BeThere connected! :D");
  withoutConfig = false;
  delay(500);
  lcd.clear();
}

void initWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("...connecting!");
    yield();
    ESP.wdtFeed();
  }
}


/*
  Retorna a qualidade (indicador de intensidade do sinal recebido) da rede WiFi.
  Retorna um número entre 0 e 100 se o WiFi estiver conectado.
  Retorna -1 se o WiFi estiver desconectado.
*/
//int Qualidade_verificar()
//{
//  if (WiFi.status() != WL_CONNECTED)
//    return -1;
//  int dBm = WiFi.RSSI();
//  if (dBm <= -100)
//    return 0;
//  if (dBm >= -50)
//    return 100;
//  return 2 * (dBm + 100);
//}
