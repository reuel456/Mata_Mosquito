# 🦟 Mata Mosquito - Cyber Arcade Edition

Uma aplicação web interativa de estilo **Cyberpunk / Arcade** que utiliza inteligência artificial e visão computacional (MediaPipe Hands) para permitir que o jogador destrua mosquitos cibernéticos utilizando gestos com as mãos através da câmara, com sistema de ranking global integrado a uma base de dados MySQL.

---

## 🎮 Sobre o Projeto

O **Mata Mosquito** substitui o clique tradicional do rato pelo rastreio em tempo real da mão do jogador. Através do processamento da câmara do dispositivo, o sistema identifica os pontos de articulação dos dedos e permite interagir com os elementos da interface em tempo real.

---

## ✨ Funcionalidades

- **Rastreio de Mãos em Tempo Real:** Mapeamento preciso da ponta do dedo indicador para controlo da mira laser.
- **Gestos de Interação (Pinça / Pinch):** Clique acionado ao juntar a ponta do indicador com o polegar.
- **Estética Cyberpunk Neon:** Interface estilizada com efeitos de *glassmorphism*, iluminação neon e efeitos sonoros visuais.
- **Mosquito Cibernético Vetorial:** SVG gerado proceduralmente via código (fallback automático caso a imagem local falhe).
- **Sistema de Dificuldade:** Opções de ritmo de surgimento dos mosquitos (Fácil, Médio, Difícil).
- **Ranking Competitivo:** Registo de pontuações e *nicknames* numa base de dados MySQL com tabela atualizada via API RESTful.

---

## 🕹️ Como Jogar & Controlos

### 📍 Posição da Mão
- **Mirar:** Levante a mão e aponte para a câmara. A mira neon acompanhará a ponta do seu **dedo indicador**.
- **Clicar / Atacar:** Junte a ponta do **dedo indicador com a ponta do polegar** (gesto de pinça 👌). A mira encolherá e piscará em rosa, executando o clique instantâneo sobre o botão ou mosquito.

### 🎯 Regras do Jogo
1. **Início:** Selecione a dificuldade no menu e utilize o gesto de pinça sobre o botão **INICIAR PARTIDA**.
2. **Pontuação:** Cada mosquito atingido concede **+10 pontos**.
3. **Vidas:** O jogador possui **3 vidas**. Se um mosquito desaparecer antes de ser atingido, perde-se 1 vida.
4. **Tempo:** Cada partida dura **30 segundos**.
5. **Recorde:** Ao terminar o tempo ou perder as vidas, insira o seu *nickname* para salvar a sua pontuação no ranking.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5 & CSS3:** Animações CSS, variáveis de cor neon e layout responsivo.
- **JavaScript (ES6+):** Lógica do jogo, manipulação do DOM e integração assíncrona (`fetch API`).
- **MediaPipe Hands:** Biblioteca da Google para deteção e rastreio de landmarks da mão.
- **Camera Utils:** Captura e processamento contínuo dos *frames* da webcam.

### Backend
- **Node.js:** Ambiente de execução para o servidor.
- **Express.js:** Framework web para criação das rotas da API (`/api/ranking`).
- **MySQL2:** Conector de base de dados relacional.
- **Dotenv:** Gestão de variáveis de ambiente de forma segura.
- **CORS:** Liberação de acessos às requisições do cliente.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** (v18 ou superior) instalado.
- Servidor **MySQL** ativo (via XAMPP, WAMP ou MySQL Server).

### 1. Clonar o Repositório
```bash
git clone [https://github.com/SEU_USUARIO/mata-mosquito.git](https://github.com/SEU_USUARIO/mata-mosquito.git)
cd mata-mosquito

```

### 2. Instalar as Dependências

```bash
npm install

```

### 3. Configurar a Base de Dados MySQL

Crie uma base de dados no MySQL chamada `mata_mosquito` e execute o script SQL abaixo:

```sql
CREATE DATABASE IF NOT EXISTS mata_mosquito;
USE mata_mosquito;

CREATE TABLE IF NOT EXISTS ranking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    pontos INT NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

### 4. Configurar as Variáveis de Ambiente (`.env`)

Crie um ficheiro `.env` na raiz do projeto com o seguinte conteúdo:

```env
PORT=3006
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=mata_mosquito

```

### 5. Iniciar o Servidor

```bash
node server.js

```

### 6. Aceder à Aplicação

Abra o navegador e aceda a:

```text
http://localhost:3006

```

---

## 📁 Estrutura do Projeto

```text
├── config/
│   └── db.js                 # Conexão com o banco de dados MySQL
├── controllers/
│   └── rankingController.js  # Lógica de busca e inserção de scores
├── routes/
│   └── rankingRoutes.js      # Definição dos endpoints da API
├── public/
│   ├── index.html            # Estrutura principal da interface
│   ├── style.css             # Estilização Cyberpunk Neon
│   └── script.js             # Lógica do jogo, MediaPipe e requisições
├── .env                      # Variáveis de ambiente
├── server.js                 # Ponto de entrada do servidor Express
└── package.json              # Dependências e scripts do Node.js
