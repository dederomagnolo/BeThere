#include <Adafruit_Sensor.h>
#include <DHT.h>
#include "ESP8266WiFi.h"
#include <WiFiClient.h>
#include <Wire.h>
#include "SPI.h"
//#include <LiquidCrystal_I2C.h>
#include <ThingSpeak.h>
#include <Ticker.h>
// Pins definition
#define pinDHT 12 //D6
#define pinDHT2 13 //D7
#define pinDHT3 14 //D5
#define typeDHT DHT22
#define pumpInputRelay 2

// Object declarations
WiFiClient client;
DHT dht(pinDHT, typeDHT);
DHT dht2(pinDHT2, typeDHT);
DHT dht3(pinDHT3, typeDHT);
//Ticker secondTicker;
//LiquidCrystal_I2C lcd(0x27, 16, 2);

// Network credentials
char ssid[] = "Satan`s Connection";
char password[] = "tininha157";
//char ssid[] = "iPhone de Débora";
//char password[] = "texas123";
//char ssid[] = "Nayane";
//char password[] = "96066499nd";

// Thingspeak credentials
// visualization channel
unsigned long myChannelNumber = 695672;
const char * myWriteAPIKey = "ZY113X3ZSZG96YC8";

// Variables declaration
int pumpFlag = 0;
unsigned long beginCommandTimer = 0;
unsigned long interval = 900000;
float internalTemperature = 0;
float internalHumidity = 0;
float externalHumidity = 0;
float externalTemperature = 0;
int statusCode = 0;
float humidity = 0;
float humidity2 = 0;
float temperature = 0;
float temperature2 = 0;

//void IRSwatchdog() 
//{
//  watchdogCount ++;
//  if (watchdogCount == 5)
//  {
//    Serial.println("Ops! travei...reiniciando");
//    ESP.reset();
//  }
//}

void setup() {
  ESP.eraseConfig();
  pinMode(pumpInputRelay, OUTPUT);
  digitalWrite(pumpInputRelay, HIGH); //bomba desligada
  dht.begin();
  dht2.begin();
  dht3.begin();
  
//  lcd.begin(16,2);
//  yield();
//  lcd.init();
//  lcd.backlight();
//  lcd.setCursor(0, 0);
//  delay(1000);
//  lcd.print("Hello!");
//  delay(1000);
//  lcd.setCursor(0, 0);
  
  WiFi.begin(ssid, password);
  Serial.begin(19200);

  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("...connecting!"); 
    yield();
  }
  Serial.println("BeThere connected! :D");
  ThingSpeak.begin(client);

//  secondTicker.attach(1, IRSwatchdog);
}

void loop() {
  //Imprime o valor do contador do watchdog
  // Serial.printf("watchdogCount= %d\n", watchdogCount);
  //Zera o contador do watchdog
  // watchdogCount = 0;
  
  Serial.println(ESP.getFreeHeap());
  Serial.println(WiFi.status());
  yield();
  
    if(WiFi.status() != WL_CONNECTED) {
      Serial.println("Connection lost!");
      WiFi.reconnect();
      delay(1000);
      yield();
      ESP.wdtFeed();
    }
  statusCode = 0; // set status to 0
  // lcd.noBacklight();
  
  // ThingSpeak - Read Pump Status
//  pumpFlag = ThingSpeak.readFloatField(myChannelNumber, 7);
//  yield();
//  statusCode = ThingSpeak.getLastReadStatus(); // check status
//  yield();
  
  if(statusCode == 200) {
    Serial.println("GET success");  
    yield();
  } else {
    Serial.println("Error to get the pump status");  
    yield();
  }
  
  if(pumpFlag == 1) {
    Serial.println("Pump on!");
    digitalWrite(pumpInputRelay, LOW); // activate pump
    yield();
  } else {
    digitalWrite(pumpInputRelay, HIGH); // deactivate pump
    Serial.println("Pump off!");
    yield();
  }
  // Read humidity and temperature from DHT22
  humidity = dht.readHumidity();
  temperature = dht.readTemperature();

  humidity2 = dht2.readHumidity();
  temperature2 = dht2.readTemperature();

  internalTemperature = (temperature + temperature2)/2;
  internalHumidity = (humidity + humidity2)/2;

  externalHumidity = dht3.readHumidity();
  externalTemperature = dht3.readTemperature();

  // Write the measures on LCD 
//  lcd.setCursor(0, 0);
//  lcd.print("H:");
//  lcd.setCursor(2, 0);
//  lcd.print(internalHumidity);
//  lcd.setCursor(0 ,1);
//  lcd.print("T:");
//  lcd.setCursor(2 ,1);
//  lcd.print(internalTemperature);
//
//  lcd.setCursor(8, 0);
//  lcd.print("H2:");
//  lcd.setCursor(11, 0);
//  lcd.print(externalHumidity);
//  lcd.setCursor(8 ,1);
//  lcd.print("T2:");
//  lcd.setCursor(11 ,1);
//  lcd.print(externalTemperature);
  
  // Just for debug - print in serial monitor
//  Serial.println("H:" + String(humidity) + "T:" + String(temperature));
//  Serial.println("H2:" + String(humidity2) + "T2:" + String(temperature2));
//  Serial.println("H3:" + String(externalHumidity) + "T3:" + String(externalTemperature));
//  Serial.println("Media T1 T2:" + String(internalTemperature));
//  Serial.println("Media H1 H2:" + String(internalHumidity));  
  
  if(millis() - beginCommandTimer > interval){
      Serial.println("Sending data..."); 
      // ThingSpeak - Set fields
      ThingSpeak.setField(3, internalHumidity);
      ThingSpeak.setField(4, internalTemperature);
      ThingSpeak.setField(5, externalHumidity);
      ThingSpeak.setField(6, externalTemperature);
//      ThingSpeak.setField(7, pumpFlag);
      yield();
     
      // ThingSpeak - Write fields
      int response = ThingSpeak.writeFields(myChannelNumber,myWriteAPIKey);
      yield();
      // Check status response
      if (response == 200){
        Serial.println("Data sent with success!");
        beginCommandTimer = millis();
        yield();
      } else{
        Serial.println("Coneection Error: " + String(response));
        yield();
      }
  }

//  if(millis() - beginCommandTimer > 15000) {
//    Serial.println("Can trigger from remote!\n");
//  }
//  
  delay(16000);
  yield();
}
