// --- CONFIGURAÇÃO DO MQTT (VERSÃO SEGURA) ---
const MQTT_BROKER = "test.mosquitto.org";
const MQTT_PORT = 8081; // Porta para ligação segura (wss)
const MQTT_TOPIC = "robopsychs/expressao";
const MQTT_CLIENT_ID = "ControladorClient_" + Math.random().toString(16).substr(2, 8);

// --- LIGAÇÃO AO MQTT ---
const client = new Paho.MQTT.Client(MQTT_BROKER, MQTT_PORT, MQTT_CLIENT_ID);
client.onConnectionLost = onConnectionLost;
client.connect({ onSuccess: onConnect, useSSL: true });

function onConnect() {
  console.log("Controlador ligado ao Broker MQTT (Seguro)!");
  // Quando liga, envia o comando inicial para o rosto 'acordar' para o estado dormindo
  sendCommandToRobot('dormindo');
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("Ligação perdida: " + responseObject.errorMessage);
  }
}

// --- LÓGICA DO TEMPORIZADOR DE INATIVIDADE ---
let idleTimer;
// Tempo em milissegundos (2 minutos). Altere o 2 para 3 para 3 minutos.
const IDLE_TIMEOUT = 2 * 60 * 1000; 

function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goToSleep, IDLE_TIMEOUT);
}

function goToSleep() {
    console.log("Tempo de inatividade atingido. A enviar comando 'dormindo'.");
    // Envia o comando para o rosto e para o robô irem dormir
    sendCommandToRobot('dormindo');
    // Desseleciona todos os botões no controlador
    buttons.forEach(button => {
        button.classList.remove('selecionado');
    });
}

const expressionMap = {
    'neutro': 0, 'triste': 1, 'cansado': 2, 'feliz': 3, 'bravo': 4, 'dormindo': 5
};
const buttons = document.querySelectorAll('.controls button');

// Função principal que é chamada pelos botões
function sendCommand(expression) {
    // A cada comando, reinicia o temporizador de inatividade
    resetIdleTimer();
    
    // Atualiza a cor do botão selecionado
    buttons.forEach(button => {
        if (button.textContent.toLowerCase() === expression) {
            button.classList.add('selecionado');
        } else {
            button.classList.remove('selecionado');
        }
    });

    // Envia o comando para o rosto e para o robô
    sendCommandToRobot(expression);
}

// Função que realmente envia a mensagem MQTT
function sendCommandToRobot(expression) {
    if (!client.isConnected()) {
        console.error("Não foi possível enviar o comando. Cliente MQTT não está ligado.");
        // Não mostra o alerta no modo de dormir automático para não ser chato
        if (expression !== 'dormindo') {
            alert("Erro: Não foi possível ligar ao servidor. Por favor, verifique a sua ligação à internet ou firewall e recarregue a página.");
        }
        return;
    }

    const expressionId = expressionMap[expression];
    const message = new Paho.MQTT.Message(String(expressionId));
    message.destinationName = MQTT_TOPIC;
    client.send(message);
    console.log(`Comando '${expression}' (código: ${expressionId}) enviado.`);
}

// Nenhum botão começa selecionado
