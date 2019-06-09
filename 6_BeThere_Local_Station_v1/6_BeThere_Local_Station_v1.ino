#include "ThingSpeak.h"
#include <SPI.h>
#include <Ethernet.h>
#include "DHT.h" //DHT Library
#include <Wire.h>
#include "pitches.h"

byte mac[] = {0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED};
EthernetClient client; //ethernet client object
// Inicializa o display no endereço 0x27

//Atribuição dos pinos
#define sensor A0
#define luz A1
#define ledAmarelo 5
#define ledVermelho 6
#define ledVerde 8
#define bomba 9
#define resetPin 12 
#define ledAzul 14
#define bipbip 15
#define timerLed 16
//Configuração do DHT
#define pinDHT 7     //DHT communication pin
#define typeDHT DHT22 //DHT sensor type, in this case DHT22

//#define autoButton 2
#define autoLed 3

DHT dht(pinDHT, typeDHT); //declaring an DHT object

//variáveis para gravação
int umidade;
int luminosidade;
String nivelUmidade;
String nivelLuz;
int codSoil;
long stopRead = 0;
long startPump = 0;
long startTimer = 0;
long passedTime = 0;

//flags
int bombaFlag = 0;
int luzFlag;
int updateTime = 0;
int recordedTime = 0;
long timerFlag = 0;
int timerON = 0;

  int melody[] = {
  NOTE_C4, NOTE_G3, NOTE_G3, NOTE_A3, NOTE_G3, 0, NOTE_B3, NOTE_C4
  };

  int noteDurations[] = {
  4, 8, 8, 4, 4, 4, 4, 4
  };

//Campos do ThingSpeak
unsigned long mainChannelNumber = 695672;
const char * myWriteAPIKey = "ZY113X3ZSZG96YC8";

void setup() {

  Serial.begin(9600);
  dht.begin(); //initialize DHT object
  Ethernet.begin(mac);
  ThingSpeak.begin(client);
  
  //Entradas e saídas

  //portas analógicas e relé
  pinMode(sensor, INPUT); //sensor de umidade
  pinMode(luz, INPUT); //porta conectada ao divisor de tensão com fotoresistor)
  pinMode(bomba, OUTPUT); //acionamento do relé
  //Leds indicadores
  pinMode(ledVerde, OUTPUT);
  pinMode(ledAmarelo, OUTPUT);
  pinMode(ledVermelho, OUTPUT);
  pinMode(ledAzul, OUTPUT); //para indicar bomba ligada
  pinMode(timerLed, OUTPUT);
  //buzzer
  pinMode(bipbip, OUTPUT);
  //Reset Button
  pinMode(resetPin, OUTPUT);

  //Estados iniciais
  digitalWrite(bomba, HIGH); //bomba desligada
  //digitalWrite(resetPin, LOW);
  digitalWrite(timerLed, LOW);


  for (int thisNote = 0; thisNote < 8; thisNote++) {

    // to calculate the note duration, take one second divided by the note type.
    //e.g. quarter note = 1000 / 4, eighth note = 1000/8, etc.
    int noteDuration = 1000 / noteDurations[thisNote];
    tone(bipbip, melody[thisNote], noteDuration);

    // to distinguish the notes, set a minimum time between them.
    // the note's duration + 30% seems to work well:
    int pauseBetweenNotes = noteDuration * 1.30;
    delay(pauseBetweenNotes);
    // stop the tone playing:
    noTone(bipbip);
  }
 
  Serial.print("------------ BE THERE - ONLINE ------------\n");
}

void loop() {

  updateTime = ThingSpeak.readFloatField(mainChannelNumber, 6);

  if(updateTime != recordedTime){ //verifica se ocorreu mudança no status do Timer
    
    recordedTime = updateTime; //grava o novo time setado

    if(recordedTime != 0){
      timerFlag = 1; //timer ligado
      digitalWrite(timerLed, HIGH);
      startTimer = millis();
      Serial.print(startTimer);
    } else{
        timerFlag = 0; //timer desligado
        digitalWrite(timerLed, LOW);
      }   
  } //se nao ocorre mudança, o tempo gravado é mantido

  if(timerFlag == 1){
    if(passedTime > (startTimer + recordedTime)){
        Serial.print("\n");
        Serial.print(recordedTime);
        startPump = millis();
        Serial.print("\nTimer mode: pump on");
        
        while(millis()<startPump+20000){
            digitalWrite(bomba, LOW);
            digitalWrite(ledAzul, HIGH);
        }

        digitalWrite(bomba, HIGH);
        digitalWrite(ledAzul, LOW);
        Serial.print("\nYour garden has been watered!");
        startTimer = millis();
    }

  }

  
  if(millis()-stopRead > 20000){
    noTone(bipbip);
    
    //leitura da umidade
    umidade = analogRead(sensor);
    //leitura da ponta analógica do divisor de tensão com foto resistor
    luminosidade = analogRead(luz);

    //check do status da bomba no ThingSpeak
    bombaFlag = ThingSpeak.readFloatField(mainChannelNumber, 5);

    //conferencia da luminosidade - atribuição de status
    if(luminosidade > 530){
      luzFlag = 0; //sem luz
    }
    else if (luminosidade <= 300){
      luzFlag = 1; //com luz incidente
    }
    else if (luminosidade > 300 && luminosidade <= 530){
      luzFlag = 2; //luz moderada
    }

    //linha de teste
    Serial.print("\nPUMP: ");
    Serial.print(bombaFlag);

    //bomba foi ligada via web
    if(bombaFlag == 1){
      Serial.print("\nThe pump is turned on by web app!\n");

      startPump = millis();
      
      while(millis()<startPump+20000){
        digitalWrite(bomba, LOW);
        digitalWrite(ledAzul, HIGH);  
      }
      
      bombaFlag = 0;
      digitalWrite(ledAzul, LOW);
      Serial.print("\nFinished watering your garden!\n");
    }
    
    //read humidity and temperature
    float h = dht.readHumidity();
    float t = dht.readTemperature();
  
    //sensor DHT read failure check
    if (isnan(h) || isnan(t)) {
      Serial.print("\n");
      Serial.print("\nDHT failed! Check Connections!");
    }
    
    //classificação do solo
    if (umidade <= 500){
      
      codSoil = 1; //solo úmido
  
      //Acende led verde
      digitalWrite(ledVerde, HIGH);
      digitalWrite(ledVermelho, LOW);
      digitalWrite(ledAmarelo, LOW);
      digitalWrite(ledAzul, LOW);
      
      if (timerFlag == 0){
        digitalWrite(bomba, HIGH); //desliga bomba
      }
    }
    
    else if (umidade > 500 && umidade < 750){
  
      codSoil = 2; //solo parcialmente umido
  
      //Acende led amarelo
      digitalWrite(ledVerde, LOW);
      digitalWrite(ledVermelho, LOW);
      digitalWrite(ledAmarelo, HIGH); 
      digitalWrite(ledAzul, LOW);

      if (timerFlag == 0){
        digitalWrite(bomba, HIGH); //desliga bomba
      }
    }
    
    else if(umidade > 750)
    { 
      codSoil = 3; //solo seco
  
      //Acende led vermelho
      digitalWrite(ledVerde, LOW);
      digitalWrite(ledVermelho, HIGH);
      digitalWrite(ledAmarelo, LOW);
      
      if (timerFlag == 0){
        digitalWrite(bomba, LOW); //liga bomba
        digitalWrite(ledAzul, HIGH); 
      }  
    }
  
    //ajustar limites para exibir o valor de 0 - 100 (seco-umido/sem luz-com luz)
    umidade = map(umidade, 0, 1023, 100, 0); 

    //imprimir na serial as leituras
    Serial.print("\n------------ BE THERE - REPORT ------------");

    if(timerFlag == 0){
      Serial.print("\nTimer mode Off");
    } else {
      Serial.print("\nIrrigation Interval:");
      Serial.print(recordedTime/3600000 + "hours");  
    }
    
    Serial.print("\n----- Soil Status ----- ");
    Serial.print("\nSoil Moisture: ");
    Serial.print(umidade);
    Serial.print("%");

    //status do solo
    if (codSoil == 1){
      nivelUmidade = "moist";
    } else if (codSoil == 2){
        nivelUmidade = "partially Moist";
    } else{
        nivelUmidade = "dry";  
    }

    if (luzFlag == 1){
      nivelLuz = "incident light";
    } else if (luzFlag == 2){
      nivelLuz = "partial light";
    } else {
      nivelLuz = "no light";
    }

    luminosidade = map(luminosidade, 0, 1023, 0, 100); 
    
    Serial.print("\nLuminosity: ");
    Serial.print(luminosidade);
    Serial.print("%\n");
    Serial.print("Your soil is " + nivelUmidade + " and your garden has " + nivelLuz);
    Serial.print("\n");
  
    //DHT posts
    Serial.print("\n----- Weather Status -----");
    Serial.print("\nHumidity: ");
    Serial.print(h);
    Serial.print("%\n");
    Serial.print("Temperature: ");
    Serial.print(t);
    Serial.print("°C\n");
    Serial.print("\n");

    //set fields
    ThingSpeak.setField(1, umidade);
    ThingSpeak.setField(2, luminosidade);
    ThingSpeak.setField(3, h);
    ThingSpeak.setField(4, t);
    ThingSpeak.setField(5, bombaFlag);
    
    //write fields
    int x = ThingSpeak.writeFields(mainChannelNumber,myWriteAPIKey);
  
    if (x == 200){
      Serial.print("Data sent with success!");
    } else{
        Serial.print("Coneection Error: " + String(x));
        Serial.print("\n");
    }

    stopRead = millis();
    passedTime = millis();
  }

  Serial.print(passedTime);
  //digitalWrite(resetPin, LOW);
  //delay de 20
  //delay(20000); // ThingSpeak precisa de pelo menos 15s de interval
  
}
