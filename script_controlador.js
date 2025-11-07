// IMPORTANTE: COLOQUE AQUI O SEU LINK DO RENDER!
const RENDER_SERVER_URL = "https://robopsychs-server.onrender.com";

const expressionMap = { 'neutro': 0, 'triste': 1, 'cansado': 2, 'feliz': 3, 'bravo': 4 };
const buttons = document.querySelectorAll('.controls button');

// --- ▼▼▼ NOVO CÓDIGO DO TIMER DE INATIVIDADE ▼▼▼ ---
let inactivityTimer; // Variável para guardar o timer

// Tempo de inatividade em milissegundos (90000ms = 1 minuto e meio)
const INACTIVITY_TIME_MS = 90000; 

// Função que é chamada quando o tempo esgota
function goToSleep() {
    console.log(`Inativo por ${INACTIVITY_TIME_MS / 1000}s. Indo dormir...`);
    // Chama sendCommand com 'dormindo'.
    // Isso vai:
    // 1. Enviar 'dormindo' para o Render (que avisa o rosto e o ESP32)
    // 2. Desselecionar todos os botões (porque nenhum se chama 'dormindo')
    sendCommand('dormindo');
}

// Função para (re)iniciar o timer de inatividade
function resetInactivityTimer() {
    // Limpa o timer antigo (se existir)
    clearTimeout(inactivityTimer);
    // Cria um novo timer
    inactivityTimer = setTimeout(goToSleep, INACTIVITY_TIME_MS);
}
// --- ▲▲▲ FIM DO NOVO CÓDIGO DO TIMER ▲▲▲ ---


async function sendCommand(expression) {
    buttons.forEach(button => {
        // Esta linha deseleciona todos os botões se a 'expression' for 'dormindo'
        button.classList.toggle('selecionado', button.textContent.toLowerCase() === expression);
    });

    // --- ▼▼▼ MUDANÇA AQUI ▼▼▼ ---
    // Se o comando NÃO for 'dormindo', reinicia o timer.
    // Se for 'dormindo', simplesmente limpa o timer (para não tentar dormir de novo).
    if (expression !== 'dormindo') {
        resetInactivityTimer();
    } else {
        clearTimeout(inactivityTimer);
    }
    // --- ▲▲▲ FIM DA MUDANÇA ▲▲▲ ---

    try {
        const response = await fetch(`${RENDER_SERVER_URL}/command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expression: expression })
        });
        if (response.ok) {
            console.log(`Comando '${expression}' enviado com sucesso.`);
        } else {
            throw new Error('Falha ao enviar o comando.');
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao enviar o comando. O servidor pode estar offline.");
    }
}

// Inicia o timer pela primeira vez quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // Começa no estado "dormindo" por padrão
    sendCommand('dormindo');
});
