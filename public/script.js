// Configurações do Estado do Jogo
let tempoRestante = 30;
let pontos = 0;
let vidas = 3;
let tempoMosquito = 1500;
let cronometroInterval = null;
let spawnInterval = null;
let jogoAtivo = false;

// Controle de Posição Suave e Gestos
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let cooldownClique = false;

// Variáveis da Câmera e MediaPipe
let hands = null;
let camera = null;
let videoElement = null;
let ponteiro = null;

// URL base da API
const API_URL = '/api/ranking';

// SVG do Mosquito Cibernético
const CYBER_FLY_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><filter id="glow-red" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter><filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter><linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232a2e3d"/><stop offset="100%" stop-color="%230d0e12"/></linearGradient></defs><g stroke="%2300f2fe" stroke-width="2" opacity="0.85" fill="none"><path d="M 45 55 L 20 40 L 10 50"/><path d="M 45 65 L 15 65 L 5 75"/><path d="M 45 75 L 25 90 L 15 105"/><path d="M 75 55 L 100 40 L 110 50"/><path d="M 75 65 L 105 65 L 115 75"/><path d="M 75 75 L 95 90 L 105 105"/></g><g filter="url(%23glow-cyan)"><path d="M 50 50 Q 15 10 30 5 Q 60 10 52 45 Z" fill="rgba(0, 242, 254, 0.3)" stroke="%2300f2fe" stroke-width="1.5"/><path d="M 70 50 Q 105 10 90 5 Q 60 10 68 45 Z" fill="rgba(0, 242, 254, 0.3)" stroke="%2300f2fe" stroke-width="1.5"/></g><ellipse cx="60" cy="80" rx="16" ry="26" fill="url(%23bodyGrad)" stroke="%23ff007f" stroke-width="1.5"/><g stroke="%23ff007f" stroke-width="2" filter="url(%23glow-red)"><line x1="48" y1="70" x2="72" y2="70"/><line x1="46" y1="80" x2="74" y2="80"/><line x1="48" y1="90" x2="72" y2="90"/></g><polygon points="50,45 70,45 66,65 54,65" fill="%23181a24" stroke="%2300f2fe" stroke-width="1.5"/><circle cx="60" cy="38" r="10" fill="%230d0e12" stroke="%2300f2fe" stroke-width="1"/><circle cx="54" cy="36" r="4.5" fill="%23ff007f" filter="url(%23glow-red)"/><circle cx="66" cy="36" r="4.5" fill="%23ff007f" filter="url(%23glow-red)"/><polygon points="59,28 61,28 60,8" fill="%23ff007f" filter="url(%23glow-red)"/></svg>';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarRanking();
    inicializarMediaPipe();
});

function inicializarMediaPipe() {
    videoElement = document.getElementById('webcam');
    ponteiro = document.getElementById('ponteiro-mao');

    if (ponteiro) {
        // Evita que o próprio ponteiro bloqueie o clique no botão/mosquito
        ponteiro.style.pointerEvents = 'none';
    }

    if (typeof Hands === 'undefined' || typeof Camera === 'undefined') {
        console.warn('MediaPipe ainda carregando...');
        return;
    }

    hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onResultsHands);

    camera = new Camera(videoElement, {
        onFrame: async () => {
            if (hands) await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });

    camera.start();
}

function onResultsHands(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Ponto 8: Indicador | Ponto 4: Polegar
        const indicador = landmarks[8];
        const polegar = landmarks[4];

        // Mapeamento das coordenadas brutas
        const targetX = (1 - indicador.x) * window.innerWidth;
        const targetY = indicador.y * window.innerHeight;

        // Filtro de suavização (Lerp) para eliminar trepidação
        cursorX += (targetX - cursorX) * 0.35;
        cursorY += (targetY - cursorY) * 0.35;

        if (ponteiro) {
            ponteiro.style.left = `${cursorX}px`;
            ponteiro.style.top = `${cursorY}px`;
            ponteiro.style.display = 'block';
        }

        // Calcula a distância entre a ponta do Indicador e do Polegar
        const dist = Math.hypot(indicador.x - polegar.x, indicador.y - polegar.y);
        const gestofechado = dist < 0.075; // Distância limite de clique

        if (gestofechado) {
            if (ponteiro) ponteiro.classList.add('pincado');

            if (!cooldownClique) {
                executarCliqueVirtual(cursorX, cursorY);
                cooldownClique = true;
                setTimeout(() => { cooldownClique = false; }, 350); // Intervalo entre cliques
            }
        } else {
            if (ponteiro) ponteiro.classList.remove('pincado');
        }
    } else {
        if (ponteiro) ponteiro.style.display = 'none';
    }
}

// Clica em qualquer botão, link ou elemento que estiver exatamente abaixo da mira
function executarCliqueVirtual(x, y) {
    const elemento = document.elementFromPoint(x, y);
    if (!elemento) return;

    // Se for um mosquito durante o jogo
    if (elemento.id === 'mosquito') {
        elemento.click();
        return;
    }

    // Se for um botão ou input clicável nos menus
    const botao = elemento.closest('button, input, a, select');
    if (botao) {
        botao.click();
    }
}

async function carregarRanking() {
    const tabela = document.getElementById('tabela-ranking');
    if (!tabela) return;

    tabela.innerHTML = '<tr><td colspan="4">Carregando dados...</td></tr>';

    try {
        const resposta = await fetch(API_URL);
        if (!resposta.ok) throw new Error('Erro ao buscar ranking');
        
        const dados = await resposta.json();
        tabela.innerHTML = '';

        if (dados.length === 0) {
            tabela.innerHTML = '<tr><td colspan="4">Sem registros ainda. Seja o primeiro!</td></tr>';
            return;
        }

        dados.forEach((item, index) => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td><strong>#${index + 1}</strong></td>
                <td>${item.nickname}</td>
                <td>${item.pontos} pts</td>
                <td>${item.data_formatada || '-'}</td>
            `;
            tabela.appendChild(linha);
        });
    } catch (erro) {
        console.error('Erro:', erro);
        tabela.innerHTML = '<tr><td colspan="4">Erro ao conectar ao servidor.</td></tr>';
    }
}

function iniciarJogo() {
    tempoMosquito = parseInt(document.getElementById('dificuldade').value);
    pontos = 0;
    vidas = 3;
    tempoRestante = 30;
    jogoAtivo = true;

    atualizarVidasUI();
    document.getElementById('pontos-atuais').innerText = pontos;
    document.getElementById('tempo').innerText = tempoRestante;

    document.getElementById('tela-inicial').classList.add('hidden');
    document.getElementById('modal-game-over').classList.add('hidden');
    document.getElementById('tela-jogo').classList.remove('hidden');

    cronometroInterval = setInterval(atualizarCronometro, 1000);
    criarMosquito();
    spawnInterval = setInterval(criarMosquito, tempoMosquito);
}

function criarMosquito() {
    const mosquitoExistente = document.getElementById('mosquito');
    if (mosquitoExistente) {
        mosquitoExistente.remove();
        vidas--;
        atualizarVidasUI();

        if (vidas <= 0) {
            finalizarJogo(false);
            return;
        }
    }

    const palco = document.getElementById('palco-jogo');
    const mosquito = document.createElement('img');
    
    mosquito.src = 'imagens/mosquito.svg';
    mosquito.onerror = () => {
        mosquito.src = CYBER_FLY_SVG;
    };

    mosquito.id = 'mosquito';
    mosquito.className = `mosquito ${tamanhoAleatorio()} ${ladoAleatorio()}`;

    const larguraMax = window.innerWidth - 120;
    const alturaMax = window.innerHeight - 150;

    const posX = Math.max(20, Math.floor(Math.random() * larguraMax));
    const posY = Math.max(80, Math.floor(Math.random() * alturaMax));

    mosquito.style.left = `${posX}px`;
    mosquito.style.top = `${posY}px`;

    mosquito.onclick = function () {
        pontos += 10;
        document.getElementById('pontos-atuais').innerText = pontos;
        mosquito.remove();
    };

    palco.appendChild(mosquito);
}

function tamanhoAleatorio() {
    return `tam${Math.floor(Math.random() * 3)}`;
}

function ladoAleatorio() {
    return Math.random() < 0.5 ? 'ladoA' : 'ladoB';
}

function atualizarVidasUI() {
    for (let i = 1; i <= 3; i++) {
        const coracao = document.getElementById(`v${i}`);
        if (!coracao) continue;
        if (i <= vidas) {
            coracao.style.opacity = '1';
            coracao.innerText = '❤️';
        } else {
            coracao.style.opacity = '0.2';
            coracao.innerText = '🖤';
        }
    }
}

function atualizarCronometro() {
    tempoRestante--;
    document.getElementById('tempo').innerText = tempoRestante;

    if (tempoRestante <= 0) {
        finalizarJogo(true);
    }
}

function finalizarJogo(vitoria) {
    jogoAtivo = false;
    clearInterval(cronometroInterval);
    clearInterval(spawnInterval);

    const mosquitoExistente = document.getElementById('mosquito');
    if (mosquitoExistente) mosquitoExistente.remove();

    document.getElementById('titulo-fim').innerText = vitoria ? '🎉 TEMPO ESGOTADO!' : '💀 GAME OVER!';
    document.getElementById('pontos-finais').innerText = pontos;
    document.getElementById('modal-game-over').classList.remove('hidden');
}

async function salvarPontuacao(event) {
    event.preventDefault();
    const nickname = document.getElementById('nickname').value;
    const btnSalvar = document.getElementById('btn-salvar');

    if (!nickname.trim()) return;

    btnSalvar.disabled = true;
    btnSalvar.innerText = 'SALVANDO...';

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, pontos })
        });

        if (!resposta.ok) throw new Error('Erro ao salvar no ranking');

        document.getElementById('nickname').value = '';
        reiniciarJogo();
    } catch (erro) {
        alert('Erro ao salvar pontuação no servidor.');
        console.error(erro);
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.innerText = 'REGISTRAR RECORDE';
    }
}

function reiniciarJogo() {
    document.getElementById('modal-game-over').classList.add('hidden');
    document.getElementById('tela-jogo').classList.add('hidden');
    document.getElementById('tela-inicial').classList.remove('hidden');
    carregarRanking();
}