// --- CONFIGURAÇÃO DO MQTT ---
const MQTT_BROKER = "test.mosquitto.org";
const MQTT_PORT = 8081;
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

// --- LÓGICA DO TEMPORIZADOR DE INATIVIDADE ---
let idleTimer;
// Tempo em milissegundos (2 * 60 * 1000 = 2 minutos)
// Altere este valor para 3 * 60 * 1000 para 3 minutos
const IDLE_TIMEOUT = 2 * 60 * 1000; 

// Função que reinicia o temporizador
function resetIdleTimer() {
    // Limpa qualquer temporizador anterior
    clearTimeout(idleTimer);
    // Cria um novo temporizador que, ao terminar, muda a expressão para "dormindo"
    idleTimer = setTimeout(() => {
        changeExpression('dormindo');
    }, IDLE_TIMEOUT);
}

// --- FUNÇÃO CHAMADA QUANDO UMA MENSAGEM CHEGA ---
function onMessageArrived(message) {
    const expressionId = parseInt(message.payloadString);
    console.log(`Comando recebido: ${expressionId}`);
    
    const expressionName = Object.keys(expressionMap).find(key => expressionMap[key] === expressionId);

    if (expressionName) {
        changeExpression(expressionName);
        // A CADA COMANDO RECEBIDO, REINICIA O TEMPORIZADOR
        resetIdleTimer();
    }
}

// Adicionada a nova expressão "dormindo"
const expressionMap = {
    'neutro': 0, 'triste': 1, 'cansado': 2, 'feliz': 3, 'bravo': 4, 'dormindo': 5
};
const expressions = Object.keys(expressionMap);

function changeExpression(expression) {
    const face = document.querySelector('.face');
    
    face.classList.remove(...expressions);

    if (expression !== 'neutro') {
        face.classList.add(expression);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicia na expressão neutra
    changeExpression('neutro');
    // Inicia o primeiro temporizador de inatividade
    resetIdleTimer();
});
