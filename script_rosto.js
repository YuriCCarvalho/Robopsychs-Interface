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

// --- ▼▼▼ NOVO CÓDIGO (GRAVAÇÃO E SIMULAÇÃO) ADICIONADO ABAIXO ▼▼▼ ---

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
            // Esta é a hora de enviar o audioBlob para o Guilherme
            // Vamos chamar a função de SIMULAÇÃO para isso
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
// VERSÃO DE SIMULAÇÃO (Não precisa da URL do Guilherme)
async function enviarAudioParaTratamento(audioBlob) {
    
    // O 'audioBlob' está aqui, a gravação funcionou.
    console.log("SIMULAÇÃO: Áudio gravado com sucesso.", audioBlob);

    // --- BLOCO DE SIMULAÇÃO ---
    // Em vez de enviar, vamos fingir uma resposta do Guilherme
    console.log("SIMULAÇÃO: Fingindo uma resposta do servidor do Guilherme...");

    // 1. Crie uma resposta falsa (como se o Guilherme a tivesse enviado)
    const respostaFalsa = {
        expressao: "feliz", // A expressão que ele mandou
        audioResposta: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Um áudio de teste da internet
    };

    // 2. Chame a função que acabamos de criar para processar essa resposta
    await processarRespostaDoGuilherme(respostaFalsa);
    
    // ------------------------------------
    // O CÓDIGO DE ENVIO REAL FICARÁ "DORMINDO" AQUI EMBAIXO
    // ------------------------------------

    const URL_DO_GUILHERME = "URL_DO_GUILHERME_AQUI"; 
    if (URL_DO_GUILHERME === "URL_DO_GUILHERME_AQUI") {
        console.log("A simulação funcionou. Quando tiver a URL real, o código abaixo será usado.");
        return; // Para a simulação, paramos aqui.
    }

    // Usa FormData para enviar o arquivo, é o método padrão
    let formData = new FormData();
    formData.append('audioFile', audioBlob, 'gravacao_usuario.webm');

    console.log("Enviando áudio para tratamento...");

    try {
        const response = await fetch(URL_DO_GUILHERME, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro do servidor: ${response.statusText}`);
        }

        const resposta = await response.json(); // Espera a resposta dele
        console.log("Resposta do tratamento recebida:", resposta);
        
        // --- QUANDO FOR REAL, A FUNÇÃO SERÁ CHAMADA AQUI ---
        await processarRespostaDoGuilherme(resposta);

    } catch (err) {
        console.error("Erro ao enviar áudio para tratamento:", err);
        alert("Falha ao enviar áudio para o servidor do Guilherme.");
    }
}


// --- FUNÇÃO DE PROCESSAMENTO (TAREFA 2B do Guilherme) ---
// Esta função pega a resposta do Guilherme e age sobre ela
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
            // Este é o "celular" da sua aplicação A (o controlador)
            // ligando para a sua aplicação B (o rosto/servos)
            await fetch(`${RENDER_SERVER_URL}/command`, { // Usa a sua URL do Render
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
