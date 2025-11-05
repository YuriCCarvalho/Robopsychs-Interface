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

// --- ▼▼▼ NOVO CÓDIGO ADICIONADO ABAIXO ▼▼▼ ---

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
            // Vamos chamar uma função para isso
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
async function enviarAudioParaTratamento(audioBlob) {
    // !! IMPORTANTE !!
    // Você PRECISA substituir 'URL_DO_GUILHERME_AQUI' pela URL que ele te passar
    const URL_DO_GUILHERME = "URL_DO_GUILHERME_AQUI"; 

    if (URL_DO_GUILHERME === "URL_DO_GUILHERME_AQUI") {
        console.error("VOCÊ PRECISA DA URL DO GUILHERME!");
        alert("A gravação funcionou, mas não posso enviá-la sem a URL do Guilherme.");
        return;
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

        const resposta = await response.json(); // Espera a resposta dele (expressão, áudio)

        console.log("Resposta do tratamento recebida:", resposta);
        
        
    } catch (err) {
        console.error("Erro ao enviar áudio para tratamento:", err);
        alert("Falha ao enviar áudio para o servidor do Guilherme.");
    }
}
