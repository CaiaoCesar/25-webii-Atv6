// src/routes/questionRoutes.js
import express from 'express';
import * as questionController from '../controllers/questionController.js';

const router = express.Router();

/**
 * Rotas de Questões
 * Base URL: /questions
 */

// CREATE - Criar nova questão
router.post('/', questionController.create);

// READ - Listar todas as questões
router.get('/', questionController.getAll);

// READ - Buscar questão por ID
router.get('/:id', questionController.getById);

// UPDATE - Atualizar questão
router.put('/:id', questionController.update);

// DELETE - Remover questão
router.delete('/:id', questionController.remove);

export default router;
