const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');

// Rota GET para listar o Top 10 do Ranking
router.get('/', rankingController.listarRanking);

// Rota POST para registrar uma nova pontuação
router.post('/', rankingController.salvarPontuacao);

module.exports = router;