// IMPORTANTE: COLOQUE AQUI O SEU LINK DO RENDER!
const RENDER_SERVER_URL = "https://robopsychs-server.onrender.com";

const expressions = ['neutro', 'triste', 'cansado', 'feliz', 'bravo', 'dormindo'];

function changeExpression(expression) {
    const face = document.querySelector('.face');
    face.className = 'face'; // Limpa todas as classes de expressão
    if (expression) {
        face.classList.add(expression);
    }
}

// Ligar ao nosso retransmissor no Render
const socket = io(RENDER_SERVER_URL);

socket.on('connect', () => {
    console.log('Conectado ao servidor do Rosto!');
});

// Ouve por comandos de mudança de expressão
socket.on('expression-change', (expression) => {
    console.log(`Comando recebido: ${expression}`);
    changeExpression(expression);
});

// Começa no estado dormindo
document.addEventListener('DOMContentLoaded', () => {
    changeExpression('dormindo');
});


