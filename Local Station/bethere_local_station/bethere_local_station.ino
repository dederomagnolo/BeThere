#include <Adafruit_Sensor.h>
#include <DHT.h>
#include "ESP8266WiFi.h"
#include <Wire.h>
#include "SPI.h"
#include <LiquidCrystal_I2C.h>
#include <ThingSpeak.h>

// Pins definition
#define pinDHT 12
#define typeDHT DHT22
#define pumpInputRelay 2

// Object declarations
WiFiClient client;
DHT dht(pinDHT, typeDHT);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Network credentials
char ssid[] = "Satan`s Connection";
char password[] = "tininha157";

// Thingspeak credentials
// visualization channel
unsigned long myChannelNumber = 695672;
const char * myWriteAPIKey = "ZY113X3ZSZG96YC8";

// Variables declaration
int pumpFlag = 0;

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
  ThingSpeak.begin(client);
}

void loop() {
  lcd.noBacklight();

  // ThingSpeak - Read Pump Status
  int pumpFlag = ThingSpeak.readFloatField(myChannelNumber, 7);
  
  if(pumpFlag == 1) {
    digitalWrite(pumpInputRelay, LOW); // activate pump
  } else {
    digitalWrite(pumpInputRelay, HIGH); // deactivate pump
  }

  // Read humidity and temperature from DHT22
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  // Write the measures on LCD 
  lcd.setCursor(0, 0);
  lcd.print("H:");
  lcd.setCursor(2, 0);
  lcd.print(humidity);
  lcd.setCursor(0 ,1);
  lcd.print("T:");
  lcd.setCursor(2 ,1);
  lcd.print(temperature);

  // Just for debug - print in serial monitor
  Serial.print("H:");
  Serial.print(humidity);
  Serial.print(" ");
  Serial.print("T:");
  Serial.print(temperature);
  Serial.print("\n");

  // ThingSpeak - Set fields
  ThingSpeak.setField(3, humidity);
  ThingSpeak.setField(4, temperature);

  // ThingSpeak - Write fields
  int response = ThingSpeak.writeFields(myChannelNumber,myWriteAPIKey);

  // Check status response
  if (response == 200){
    Serial.print("Data sent with success!");
  } else{
    Serial.print("Coneection Error: " + String(response));
    Serial.print("\n");
  }
  
  delay(15000);
}
