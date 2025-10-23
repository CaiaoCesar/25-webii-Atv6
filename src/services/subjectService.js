// src/services/subjectService.js
import prisma from '../config/database.js';

/**
 * Subject Service
 * Responsável pela lógica de negócio relacionada às disciplinas
 */

export const getAllSubjects = async () => {
  const disciplinas = await prisma.subject.findMany({
    select: {
      id: true,
      nome: true,
      ativa: true,
      professorId: true,  
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return disciplinas;
};

export const getSubjectById = async (subjectId) => {
  if (!subjectId || isNaN(subjectId) || subjectId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  const disciplina = await prisma.subject.findUnique({
    where: { id: parseInt(subjectId) },
    select: {
      id: true,
      nome: true,
      ativa: true,
      professorId: true,  
      createdAt: true,
      updatedAt: true
    },
  });
  return disciplina;
};

const nomeExists = async (nome) => {
  const disciplina = await prisma.subject.findUnique({
    where: { nome },
  });
  return !!disciplina;
};

const validateSubjectData = (subjectData) => {
  const { nome, professorId } = subjectData;
  if (!nome || !professorId) {
    throw new Error('Nome e ID do professor são obrigatórios.');
  }
};

export const createSubject = async (subjectData) => {
  validateSubjectData(subjectData);

  // ✅ CORREÇÃO: verificar nome em vez de email
  const nomeJaExiste = await nomeExists(subjectData.nome);
  if (nomeJaExiste) {
    throw new Error('Nome de disciplina já cadastrado no sistema');
  }

  const novaDisciplina = await prisma.subject.create({
    data: {
      nome: subjectData.nome,
      ativa: subjectData.ativa ?? true, // default true
      professorId: subjectData.professorId,
    },
    select: {
      id: true,
      nome: true,
      ativa: true,
      professorId: true,  
      createdAt: true,
      updatedAt: true
    },
  });
  return novaDisciplina;
};

export const updateSubject = async (subjectId, subjectData) => { // ✅ Nome correto
  if (!subjectId || isNaN(subjectId) || subjectId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }
  
  const disciplinaExistente = await prisma.subject.findUnique({
    where: { id: parseInt(subjectId) },
  });

  if (!disciplinaExistente) {
    throw new Error(`Disciplina com ID ${subjectId} não encontrada`);
  }

  if (subjectData.nome && (subjectData.nome !== disciplinaExistente.nome)) {
    const nomeJaExiste = await nomeExists(subjectData.nome);
    if (nomeJaExiste) {
      throw new Error('Nome já está em uso por outra disciplina');
    }
  }

  const dadosAtualizacao = {};
  if (subjectData.nome) dadosAtualizacao.nome = subjectData.nome;
  if (subjectData.ativa !== undefined) dadosAtualizacao.ativa = subjectData.ativa;
  if (subjectData.professorId) dadosAtualizacao.professorId = subjectData.professorId;

  const disciplinaAtualizada = await prisma.subject.update({
    where: { id: parseInt(subjectId) },
    data: dadosAtualizacao,
    select: {
      id: true,
      nome: true,
      ativa: true,
      professorId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return disciplinaAtualizada;
};

export const deleteSubject = async (subjectId) => {
  if (!subjectId || isNaN(subjectId) || subjectId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  const disciplinaExistente = await prisma.subject.findUnique({
    where: { id: parseInt(subjectId) },
    select: {
      id: true,
      nome: true,
      ativa: true,
      professorId: true,
    },
  });

  if (!disciplinaExistente) {
    throw new Error(`Disciplina com ID ${subjectId} não encontrada`);
  }

  await prisma.subject.delete({
    where: { id: parseInt(subjectId) },
  });

  return disciplinaExistente;
};

export default {
  getAllSubjects,
  getSubjectById,
  createSubject,
  deleteSubject,
  updateSubject
};