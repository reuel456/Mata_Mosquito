const db = require('../config/db');

// Retorna os 10 melhores jogadores do ranking
exports.listarRanking = async (req, res) => {
    try {
        const query = `
            SELECT 
                nickname, 
                pontos, 
                DATE_FORMAT(data_registro, '%d/%m/%Y %H:%i') AS data_formatada
            FROM pontuacoes 
            ORDER BY pontos DESC 
            LIMIT 10
        `;

        const [linhas] = await db.query(query);
        return res.status(200).json(linhas);

    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        return res.status(500).json({ 
            mensagem: 'Erro interno ao carregar o ranking.' 
        });
    }
};

// Salva uma nova pontuação no banco de dados
exports.salvarPontuacao = async (req, res) => {
    try {
        const { nickname, pontos } = req.body;

        // Validação básica dos dados recebidos
        if (!nickname || typeof nickname !== 'string' || nickname.trim() === '') {
            return res.status(400).json({ 
                mensagem: 'O nickname é obrigatório.' 
            });
        }

        if (pontos === undefined || isNaN(pontos) || pontos < 0) {
            return res.status(400).json({ 
                mensagem: 'A pontuação informada é inválida.' 
            });
        }

        const nickSanitizado = nickname.trim().slice(0, 50);

        const query = 'INSERT INTO pontuacoes (nickname, pontos) VALUES (?, ?)';
        const [resultado] = await db.query(query, [nickSanitizado, Number(pontos)]);

        return res.status(201).json({
            mensagem: 'Pontuação salva com sucesso!',
            id: resultado.insertId,
            nickname: nickSanitizado,
            pontos: Number(pontos)
        });

    } catch (error) {
        console.error('Erro ao salvar pontuação:', error);
        return res.status(500).json({ 
            mensagem: 'Erro interno ao salvar a pontuação.' 
        });
    }
};