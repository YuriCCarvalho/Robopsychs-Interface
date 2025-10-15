// --- CONFIGURAÇÃO DO MQTT (VERSÃO SEGURA) ---
const MQTT_BROKER = "test.mosquitto.org";
const MQTT_PORT = 8081; // Porta para ligação segura (wss)
const MQTT_TOPIC = "robopsychs/expressao";
const MQTT_CLIENT_ID = "RostoClient_" + Math.random().toString(16).substr(2, 8);

// --- LIGAÇÃO AO MQTT ---
const client = new Paho.MQTT.Client(MQTT_BROKER, MQTT_PORT, MQTT_CLIENT_ID);
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.connect({ onSuccess: onConnect, useSSL: true });

function onConnect() {
    console.log("Rosto ligado ao Broker MQTT (Seguro)!");
    client.subscribe(MQTT_TOPIC);
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("Ligação perdida: " + responseObject.errorMessage);
    }
}

// --- FUNÇÃO CHAMADA QUANDO UMA MENSAGEM CHEGA (A ÚNICA LÓGICA DO ROSTO) ---
function onMessageArrived(message) {
    const expressionId = parseInt(message.payloadString);
    console.log(`Comando recebido: ${expressionId}`);
    
    const expressionName = Object.keys(expressionMap).find(key => expressionMap[key] === expressionId);

    if (expressionName) {
        changeExpression(expressionName);
    }
}

const expressionMap = {
    'neutro': 0, 'triste': 1, 'cansado': 2, 'feliz': 3, 'bravo': 4, 'dormindo': 5
};
const expressions = Object.keys(expressionMap);

function changeExpression(expression) {
    const face = document.querySelector('.face');
    
    face.classList.remove(...expressions);
    face.classList.add(expression);
}

// O rosto começa sem expressão definida e espera o primeiro comando do controlador
