import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const criaUsuario = async (nome: string, username: string, senha: string) => {
  try {
    return await prisma.usuario.create({
      data: {
        nome,
        usuario: username,
        senha,
      },
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw new Error('Erro ao criar usuário. Verifique se o username já está em uso.');
  }
};

export const criaEvento = async (titulo: string, descricao: string, dataHora: Date, criadorId: number) => {
  try {
    return await prisma.evento.create({
      data: {
        titulo,
        descricao,
        dataHora,
        criador: {
          connect: { id: criadorId },
        },
      },
    });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    throw new Error('Erro ao criar evento. Certifique-se de fornecer dados válidos.');
  }
};

export const criaComentario = async (texto: string, usuarioId: number, eventoId: number) => {
  try {
    return await prisma.comentario.create({
      data: {
        texto,
        usuario: {
          connect: { id: usuarioId },
        },
        evento: {
          connect: { id: eventoId },
        },
      },
    });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    throw new Error('Erro ao criar comentário. Certifique-se de fornecer dados válidos.');
  }
};
