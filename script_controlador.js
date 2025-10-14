// --- CONFIGURAÇÃO DO MQTT (VERSÃO SEGURA) ---
const MQTT_BROKER = "test.mosquitto.org";
const MQTT_PORT = 8081; // Porta para ligação segura (wss)
const MQTT_TOPIC = "robopsychs/expressao";
const MQTT_CLIENT_ID = "ControladorClient_" + Math.random().toString(16).substr(2, 8);

// --- LIGAÇÃO AO MQTT ---
const client = new Paho.MQTT.Client(MQTT_BROKER, MQTT_PORT, MQTT_CLIENT_ID);
client.onConnectionLost = onConnectionLost;
// Ligar usando SSL (para wss://)
client.connect({ onSuccess: onConnect, useSSL: true });

function onConnect() {
  console.log("Controlador ligado ao Broker MQTT (Seguro)!");
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("Ligação perdida: " + responseObject.errorMessage);
  }
}

const expressionMap = {
    'neutro': 0, 'triste': 1, 'cansado': 2, 'feliz': 3, 'bravo': 4
};
const buttons = document.querySelectorAll('.controls button');

function sendCommand(expression) {
    if (!client.isConnected()) {
        console.error("Não foi possível enviar o comando. Cliente MQTT não está ligado.");
        alert("Erro: Não foi possível ligar ao servidor. Por favor, verifique a sua ligação à internet ou firewall e recarregue a página.");
        return;
    }
    
    buttons.forEach(button => {
        if (button.textContent.toLowerCase() === expression) {
            button.classList.add('selecionado');
        } else {
            button.classList.remove('selecionado');
        }
    });

    const expressionId = expressionMap[expression];
    const message = new Paho.MQTT.Message(String(expressionId));
    message.destinationName = MQTT_TOPIC;
    client.send(message);
    console.log(`Comando '${expression}' (código: ${expressionId}) enviado.`);
}

document.addEventListener('DOMContentLoaded', () => {
    buttons[0].classList.add('selecionado');
});