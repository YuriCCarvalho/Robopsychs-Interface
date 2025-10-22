// IMPORTANTE: COLOQUE AQUI O SEU LINK DO RENDER!
const RENDER_SERVER_URL = "https://robopsychs-server.onrender.com";

const expressionMap = { 'neutro': 0, 'triste': 1, 'cansado': 2, 'feliz': 3, 'bravo': 4 };
const buttons = document.querySelectorAll('.controls button');

async function sendCommand(expression) {
    buttons.forEach(button => {
        button.classList.toggle('selecionado', button.textContent.toLowerCase() === expression);
    });

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
// Nenhum botão começa selecionado
