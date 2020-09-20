#include <Adafruit_Sensor.h>
#include <DHT.h>
#include "ESP8266WiFi.h"
#include <Wire.h>
#include "SPI.h"
#include <LiquidCrystal_I2C.h>
#include <ThingSpeak.h>

// Pins definition
#define pinDHT 12
#define pinDHT2 13
#define pinDHT3 14
#define typeDHT DHT22
#define pumpInputRelay 2

// Object declarations
WiFiClient client;
DHT dht(pinDHT, typeDHT);
DHT dht2(pinDHT2, typeDHT);
DHT dht3(pinDHT3, typeDHT);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Network credentials
char ssid[] = "Satan`s Connection";
char password[] = "tininha157";
//char ssid[] = "iPhone de Débora";
//char password[] = "texas123";

// Thingspeak credentials
// visualization channel
unsigned long myChannelNumber = 695672;
const char * myWriteAPIKey = "ZY113X3ZSZG96YC8";

// Variables declaration
int pumpFlag = 0;
long int endCommandTimer = 0;
long int beginCommandTimer = 0;
float internalTemperature = 0;
float internalHumidity = 0;

void setup() {
  pinMode(pumpInputRelay, OUTPUT);
  digitalWrite(pumpInputRelay, HIGH); //bomba desligada
  
  lcd.begin(16,2);
  delay(1000);
  lcd.init();
  delay(1000);
  lcd.backlight();
  lcd.setCursor(0, 0);
  delay(1000);
  lcd.print("Hello!");
  delay(1000);
  lcd.setCursor(0, 0);
  
  WiFi.begin(ssid, password);
  Serial.begin(19200);
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("...connecting!");  
  }
  Serial.println("BeThere connected! :D");
  dht.begin();
  dht2.begin();
  dht3.begin();
  ThingSpeak.begin(client);
}

void loop() {
  int statusCode = 0; // declare statusCode = 0 to get from responses
  // lcd.noBacklight();

  // ThingSpeak - Read Pump Status
  int pumpFlag = ThingSpeak.readFloatField(myChannelNumber, 7);
  
  statusCode = ThingSpeak.getLastReadStatus(); // check status 
  if(statusCode == 200) {
    Serial.println("GET success");  
  } else {
    Serial.println("Error to get the pump status");  
  }
  
  if(pumpFlag == 1) {
    Serial.println("Pump on!");
    digitalWrite(pumpInputRelay, LOW); // activate pump
  } else {
    digitalWrite(pumpInputRelay, HIGH); // deactivate pump
    Serial.println("Pump off!");
  }

  // Read humidity and temperature from DHT22
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  float humidity2 = dht2.readHumidity();
  float temperature2 = dht2.readTemperature();

  float humidity3 = dht3.readHumidity();
  float temperature3 = dht3.readTemperature();

  // Write the measures on LCD 
  lcd.setCursor(0, 0);
  lcd.print("H:");
  lcd.setCursor(2, 0);
  lcd.print(humidity);
  lcd.setCursor(0 ,1);
  lcd.print("T:");
  lcd.setCursor(2 ,1);
  lcd.print(temperature);

  lcd.setCursor(8, 0);
  lcd.print("H2:");
  lcd.setCursor(11, 0);
  lcd.print(humidity2);
  lcd.setCursor(8 ,1);
  lcd.print("T2:");
  lcd.setCursor(11 ,1);
  lcd.print(temperature2);
  
  // Just for debug - print in serial monitor
  Serial.print("H:");
  Serial.print(humidity);
  Serial.print(" ");
  Serial.print("T:");
  Serial.print(temperature);
  Serial.print("\n");
  Serial.print("H2:");
  Serial.print(humidity2);
  Serial.print(" ");
  Serial.print("T2:");
  Serial.print(temperature2);
  Serial.print("\n");
  Serial.print("H3:");
  Serial.print(humidity3);
  Serial.print(" ");
  Serial.print("T3:");
  Serial.print(temperature3);
  Serial.print("\n");

  Serial.print("Media T1 T2:");
  internalTemperature = (temperature + temperature2)/2;
  Serial.print(internalTemperature);
  Serial.print("\n");
  Serial.print("Media H1 H2:");
  internalHumidity = (humidity + humidity2)/2;
  Serial.print(internalHumidity);
  Serial.print("\n");

  if(millis() - beginCommandTimer > 30000){ 
      // ThingSpeak - Set fields
      ThingSpeak.setField(3, humidity);
      ThingSpeak.setField(4, temperature);
      ThingSpeak.setField(7, pumpFlag);
    
      // ThingSpeak - Write fields
      int response = ThingSpeak.writeFields(myChannelNumber,myWriteAPIKey);
  
      // Check status response
      if (response == 200){
        Serial.println("Data sent with success!");
        beginCommandTimer = millis();
      } else{
        Serial.print("Coneection Error: " + String(response));
        Serial.print("\n");
      }
  }

  if(millis() - beginCommandTimer > 15000) {
    Serial.println("Can trigger from remote!\n");
  }
  
  delay(3000);
}
