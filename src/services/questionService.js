// src/services/questionService.js
import prisma from '../config/database.js';

/**
 * Question Service
 * Responsável pela lógica de negócio relacionada às questões
 */

export const getAllQuestions = async () => {
  const questoes = await prisma.question.findMany({
    select: {
      id: true,             
      enunciado: true,    
      dificuldade: true,
      respostaCorreta: true,
      disciplinaId: true,   
      autorId: true,
      ativa: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return questoes;
};

export const getQuestionById = async (questionId) => {
  if (!questionId || isNaN(questionId) || questionId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  const questao = await prisma.question.findUnique({
    where: { id: parseInt(questionId) },
    select: {
      id: true,             
      enunciado: true,    
      dificuldade: true,
      respostaCorreta: true,
      disciplinaId: true,   
      autorId: true,
      ativa: true,
      createdAt: true,
      updatedAt: true
    },
  });
  return questao;
};

const enunciadoExists = async (enunciado) => {
  const questao = await prisma.question.findUnique({
    where: { enunciado }, // ✅ CORREÇÃO: busca por enunciado, não email
  });
  return !!questao;
};

const validateQuestionData = (questionData) => {
  const { enunciado, dificuldade, respostaCorreta, disciplinaId, autorId } = questionData;

  // ✅ CORREÇÃO: 'ativa' não é obrigatória (tem default)
  if (!enunciado || !dificuldade || !respostaCorreta || !disciplinaId || !autorId) {
    throw new Error('Enunciado, dificuldade, resposta correta, id da disciplina e id do autor são obrigatórios');
  }

  // ✅ Validação adicional para dificuldade
  if (dificuldade < 1 || dificuldade > 5) {
    throw new Error('Dificuldade deve ser entre 1 e 5');
  }
};

export const createQuestion = async (questionData) => { // ✅ Nome correto
  validateQuestionData(questionData);

  // ✅ CORREÇÃO: verificar enunciado, não email
  const enunciadoJaExiste = await enunciadoExists(questionData.enunciado);
  if (enunciadoJaExiste) {
    throw new Error('Enunciado já cadastrado no sistema');
  }

  const novaQuestao = await prisma.question.create({
    data: {
      enunciado: questionData.enunciado,
      dificuldade: questionData.dificuldade,
      respostaCorreta: questionData.respostaCorreta,
      disciplinaId: questionData.disciplinaId,
      autorId: questionData.autorId,
      ativa: questionData.ativa ?? true // default true
    },
    select: {
      id: true,             
      enunciado: true,    
      dificuldade: true,
      respostaCorreta: true,
      disciplinaId: true,   
      autorId: true,
      ativa: true,
      createdAt: true,
      updatedAt: true
    },
  });
  return novaQuestao;
};

export const updateQuestion = async (questionId, questionData) => {
  if (!questionId || isNaN(questionId) || questionId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  const questaoExistente = await prisma.question.findUnique({
    where: { id: parseInt(questionId) },
  });

  if (!questaoExistente) {
    throw new Error(`Questão com ID ${questionId} não encontrada`);
  }

  if (questionData.enunciado && (questionData.enunciado !== questaoExistente.enunciado)) {
    const enunciadoJaExiste = await enunciadoExists(questionData.enunciado);
    if (enunciadoJaExiste) {
      throw new Error('Enunciado já está em uso por outra questão');
    }
  }

  // ✅ Validação de dificuldade na atualização também
  if (questionData.dificuldade && (questionData.dificuldade < 1 || questionData.dificuldade > 5)) {
    throw new Error('Dificuldade deve ser entre 1 e 5');
  }

  const dadosAtualizacao = {};
  if (questionData.enunciado) dadosAtualizacao.enunciado = questionData.enunciado;
  if (questionData.dificuldade) dadosAtualizacao.dificuldade = questionData.dificuldade;
  if (questionData.respostaCorreta) dadosAtualizacao.respostaCorreta = questionData.respostaCorreta;
  if (questionData.disciplinaId) dadosAtualizacao.disciplinaId = questionData.disciplinaId;
  if (questionData.autorId) dadosAtualizacao.autorId = questionData.autorId;
  if (questionData.ativa !== undefined) dadosAtualizacao.ativa = questionData.ativa;

  const questaoAtualizada = await prisma.question.update({
    where: { id: parseInt(questionId) },
    data: dadosAtualizacao,
    select: {
      id: true,             
      enunciado: true,    
      dificuldade: true,
      respostaCorreta: true,
      disciplinaId: true,   
      autorId: true,
      ativa: true,
      createdAt: true,
      updatedAt: true
    },
  });
  return questaoAtualizada;
};

export const deleteQuestion = async (questionId) => {
  if (!questionId || isNaN(questionId) || questionId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  const questaoExistente = await prisma.question.findUnique({
    where: { id: parseInt(questionId) },
    select: {
      id: true,             
      enunciado: true,    
      dificuldade: true,
      respostaCorreta: true,
      disciplinaId: true,   
      autorId: true,
    },
  });

  if (!questaoExistente) {
    throw new Error(`Questão com ID ${questionId} não encontrada`);
  }

  await prisma.question.delete({
    where: { id: parseInt(questionId) },
  });

  return questaoExistente;
};

// ✅ CORREÇÃO: Exportações corretas
export default {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  deleteQuestion,
  updateQuestion
};