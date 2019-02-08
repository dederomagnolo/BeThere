//Atribuição dos pinos
#define sensor A0
#define bomba 3
#define ledVerde 8
#define ledAmarelo 9
#define ledVermelho 10
#define luz A1

//variáveis para gravação
int umidade;
int luminosidade;
String nivelUmidade;


void setup() {
  
  Serial.begin(9600);
  
  //Entradas e saída
  pinMode(sensor, INPUT); //sensor de umidade
  pinMode(luz, INPUT); //sensor de luminosidade (conectada ao divisor de tensão com fotoresistor)
  pinMode(bomba, OUTPUT); //acionamento do relé

  //Leds indicadores
  pinMode(ledVerde, OUTPUT);
  pinMode(ledAmarelo, OUTPUT);
  pinMode(ledVermelho, OUTPUT);

  digitalWrite(bomba, HIGH);
}

void loop() {

  //leitura da umidade
  umidade = analogRead(sensor);

  //classificação do solo
  if (umidade >= 200 && umidade <=500){
    
    nivelUmidade = "Úmido";

    //Acende led verde
    digitalWrite(ledVerde, HIGH);
    digitalWrite(ledVermelho, LOW);
    digitalWrite(ledAmarelo, LOW);
    digitalWrite(bomba, HIGH);
  } 
  
  else if (umidade > 500 && umidade < 850){
    
    nivelUmidade = "Quase Seco";

    //Acende led amarelo
    digitalWrite(ledVerde, LOW);
    digitalWrite(ledVermelho, LOW);
    digitalWrite(ledAmarelo, HIGH); 
    digitalWrite(bomba, HIGH);
  }
  
  else if(umidade >= 850 && umidade <= 1024)
  { 
    
    nivelUmidade = "Seco";

    //Acende led vermelho
    digitalWrite(ledVerde, LOW);
    digitalWrite(ledVermelho, HIGH);
    digitalWrite(ledAmarelo, LOW);
    digitalWrite(bomba, LOW);
  }

  //ajustar limites para exibir o valor de 0 - 100 (seco-umido/sem luz-com luz)
  umidade = map(umidade, 0, 1024, 100, 0); 
  
  //leitura da ponta analógica do divisor de tensão com foto resistor
  luminosidade = analogRead(luz);
  luminosidade = map(luminosidade, 0, 1024, 0, 100);

  //plot no serial monitor
  Serial.print("\numidade: ");
  Serial.print(umidade);
  Serial.print("%");
  Serial.print("\nluminosidade: ");
  Serial.print(luminosidade);
  Serial.print("%");
  Serial.print("\n");
  Serial.print(nivelUmidade);

  //delay de 2s
  delay(2); 
}
