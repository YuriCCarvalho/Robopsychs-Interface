// IMPORTANTE: COLOQUE AQUI O SEU LINK DO RENDER!
const RENDER_SERVER_URL = "https://robopsychs-server.onrender.com";

const expressionMap = { 'neutro': 0, 'triste': 1, 'cansado': 2, 'feliz': 3, 'bravo': 4 };

// --- ▼▼▼ CORREÇÃO AQUI ▼▼▼ ---
// Espera o HTML estar 100% pronto antes de executar qualquer código
document.addEventListener('DOMContentLoaded', () => {

    // --- Toda a lógica agora vive aqui dentro ---

    // Pega os botões DEPOIS que eles com certeza já existem
    const buttons = document.querySelectorAll('.controls button');

    let inactivityTimer; // Variável para guardar o timer
    const INACTIVITY_TIME_MS = 90000; // 1 minuto e meio

    // Função que é chamada quando o tempo esgota
    function goToSleep() {
        console.log(`Inativo por ${INACTIVITY_TIME_MS / 1000}s. Indo dormir...`);
        // Chama sendCommand com 'dormindo'.
        // O 'async' não é necessário aqui, pois não precisamos "esperar"
        sendCommand('dormindo');
    }

    // Função para (re)iniciar o timer de inatividade
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(goToSleep, INACTIVITY_TIME_MS);
    }

    // Função principal que envia o comando
    async function sendCommand(expression) {
        
        // Agora 'buttons' com certeza não está vazio
        buttons.forEach(button => {
            button.classList.toggle('selecionado', button.textContent.toLowerCase() === expression);
        });

        if (expression !== 'dormindo') {
            resetInactivityTimer();
        } else {
            clearTimeout(inactivityTimer);
        }

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

    // --- Fim das funções ---

    // Adiciona os 'clicks' nos botões que agora já existem
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const expression = button.textContent.toLowerCase();
            sendCommand(expression);
        });
    });

    // Inicia o estado da página
    sendCommand('dormindo');

});

