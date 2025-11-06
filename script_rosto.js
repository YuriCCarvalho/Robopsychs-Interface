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

// --- ▼▼▼ NOVO CÓDIGO (GRAVAÇÃO E ENVIO REAL) ADICIONADO ABAIXO ▼▼▼ ---

// --- Lógica de Gravação de Áudio ---

const gravarBtn = document.getElementById('gravarBtn');
const pararBtn = document.getElementById('pararBtn');

// Variáveis para guardar o estado da gravação
let mediaRecorder; // O objeto que realmente grava
let audioChunks = []; // Um array para guardar os "pedaços" de áudio

// O que fazer quando o usuário clicar em "Gravar"
gravarBtn.addEventListener('click', async () => {
    try {
        // 1. Pedir permissão para usar o microfone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // 2. Iniciar o MediaRecorder
        mediaRecorder = new MediaRecorder(stream);
        
        // 3. O que fazer quando o gravador tiver um "pedaço" de áudio
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        // 4. O que fazer quando o gravador PARAR
        mediaRecorder.onstop = () => {
            // Junta todos os "pedaços" em um único arquivo de áudio
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            
            // Limpa os pedaços para a próxima gravação
            audioChunks = [];

            // --- AQUI ENTRA O "TRATAMENTO" ---
            // Enviar o audioBlob para o link que você gerou
            enviarAudioParaTratamento(audioBlob);

            // Reseta os botões
            gravarBtn.disabled = false;
            pararBtn.disabled = true;
        };

        // 5. Começa a gravar!
        mediaRecorder.start();

        // Atualiza os botões
        gravarBtn.disabled = true;
        pararBtn.disabled = false;
        console.log("Gravação iniciada...");

    } catch (err) {
        console.error("Erro ao tentar gravar:", err);
        alert("Não foi possível iniciar a gravação. Você deu permissão para o microfone?");
    }
});

// O que fazer quando o usuário clicar em "Parar"
pararBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    console.log("Gravação parada.");
});


// --- FUNÇÃO DE "TRATAMENTO" (Envio) ---
// VERSÃO REAL (Envia para o seu link do Webhook.site)
async function enviarAudioParaTratamento(audioBlob) {
    
    // Esta é a URL que você gerou, como o Guilherme pediu
    const URL_PARA_TESTE = "https://webhook.site/834ffb53-cacb-4f7f-aa20-669d6628efb7"; 

    // Usa FormData para enviar o arquivo, é o método padrão
    let formData = new FormData();
    formData.append('audioFile', audioBlob, 'gravacao_usuario.webm');

    console.log("Enviando áudio para o Webhook de teste...");

    try {
        const response = await fetch(URL_PARA_TESTE, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro do servidor: ${response.statusText}`);
        }

        console.log("SUCESSO! Áudio enviado para o webhook.");
        alert("Teste concluído! O áudio foi enviado para o link de teste.");

        // NOTA: Não vamos processar a resposta, pois o webhook.site
        // não devolve o JSON que o Guilherme vai devolver.
        // Já provamos que o envio (tratamento) funciona.

    } catch (err) {
        console.error("Erro ao enviar áudio para o webhook:", err);
        alert("Falha ao enviar áudio para o link de teste.");
    }
}


// --- FUNÇÃO DE PROCESSAMENTO (TAREFA 2B do Guilherme) ---
// Esta função vai ser usada quando tivermos o link REAL do Guilherme.
// Por enquanto, ela fica aqui esperando.
async function processarRespostaDoGuilherme(resposta) {
    console.log(`Processando resposta: tocando áudio e mudando expressão para '${resposta.expressao}'`);

    // 1. Reproduzir o áudio de resposta que ele mandou
    if (resposta.audioResposta) {
        try {
            const audioDeResposta = new Audio(resposta.audioResposta);
            await audioDeResposta.play();
            console.log("Reprodução de áudio concluída.");
        } catch (e) {
            console.error("Erro ao tentar tocar o áudio de resposta:", e);
            alert("Erro ao tocar o áudio. O navegador pode ter bloqueado.");
        }
    }

    // 2. Mudar a expressão do rosto (enviando para o SEU servidor Render)
    if (resposta.expressao) {
        try {
            await fetch(`${RENDER_SERVER_URL}/command`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expression: resposta.expressao })
            });
            console.log(`Comando '${resposta.expressao}' enviado para o servidor Render.`);
        } catch (error) {
            console.error("Erro ao enviar comando de expressão para o Render:", error);
        }
    }
}
