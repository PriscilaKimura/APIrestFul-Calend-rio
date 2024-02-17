import express from 'express';

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(express.json());

// Use suas rotas
//app.use('/api/eventos', eventosRoutes);
//app.use('/api/usuarios', usuariosRoutes);


app.get('/eventos', async (req: Request, res: Response) => {
try {
const usuarioLogado = (req as any).sessao.usuarioLogado(); // Assumindo que 'sessao' é um middleware que adiciona 'usuarioLogado' ao objeto 'req'

const meusEventos = await prisma.evento.findMany({
where: { criadorId: Number(usuarioLogado.id) },
include: {
criador: true,
convidados: {
include: { usuario: true },
},
comentarios: {
include: { usuario: true },
},
},
});

res.json({ meusEventos });
} catch (error) {
console.error('Erro ao buscar eventos:', error);
res.status(500).json({ error: 'Erro ao buscar eventos' });
}
});

    // Lista os eventos do usuário logado e os eventos em que foi convidado
app.get('/eventos', async (req: Request, res: Response) => {
try {
const usuarioLogadoId =  (req as any).usuarioLogadoId; /* Falta construir lógica para obter o ID do usuário logado */
const meusEventos = await prisma.evento.findMany({
where: { criadorId: usuarioLogadoId },
include: {
criador: true,
convidados: {
            include: { usuario: true },
          },
          comentarios: {
            include: { usuario: true },
          },
        },
      });
      const eventosQueFuiConvidado = await prisma.evento.findMany({
        where: { convidados: { some: { usuarioId: usuarioLogadoId } } },
        include: {
          criador: true,
          convidados: {
            include: { usuario: true },
          },
          comentarios: {
            include: { usuario: true },
          },
        },
      });

      res.json({ meusEventos, eventosQueFuiConvidado });
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      res.status(500).json({ error: 'Erro ao buscar eventos' });
    }
  });

  // Busca um evento pelo ID
  app.get('/eventos/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const usuarioLogadoId = 0; /*Falta construir a lógica para obter o ID do usuário logado */
      const evento = await prisma.evento.findUnique({
        where: { id: Number(id), criadorId: usuarioLogadoId },
      });

      if (!evento) {
        res.status(404).json({ error: 'Evento não encontrado' });
        return;
      }

      res.json(evento);
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      res.status(500).json({ error: 'Erro ao buscar evento' });
    }
  });

  // Cria um novo evento
  app.post('/eventos', async (req: Request, res: Response) => {
    const { titulo, descricao, dataHora } = req.body;
    try {
      const usuarioLogadoId = (req as any).usuarioLogadoId; /* Falta a lógica para obter o ID do usuário logado */
      const evento = await prisma.evento.create({
        data: {
          titulo,
          descricao,
          dataHora: new Date(dataHora),
          criador: {
            connect: { id: usuarioLogadoId },
          },
        },
      });

      res.json(evento);
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      res.status(500).json({ error: 'Erro ao criar evento' });
    }
  });

  // Atualiza um evento pelo ID
app.patch('/eventos/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { titulo, descricao, dataHora } = req.body;

    try {
      const usuarioLogadoId = (req as any).usuarioLogadoId; /* Falta a lógica para obter o ID do usuário logado */
      const evento = await prisma.evento.update({
        where: { id: Number(id), criadorId: usuarioLogadoId },
        data: { titulo, descricao, dataHora: new Date(dataHora) },
      });

      res.json(evento);
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      res.status(500).json({ error: 'Erro ao atualizar evento' });
    }
  });

  // Deleta um evento pelo ID
  app.delete('/eventos/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const usuarioLogadoId = 0;
      const evento = await prisma.evento.delete({
        where: { id: Number(id), criadorId: usuarioLogadoId },
      });

      res.json(evento);
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      res.status(500).json({ error: 'Erro ao deletar evento' });
    }
  });

  // Convida um usuário para um evento
  app.patch('/eventos/:id/convidar/:convidadoId', async (req: Request, res: Response) => {
    const { id, convidadoId } = req.params;

    try {
      const usuarioLogadoId =  (req as any).usuarioLogadoId;/* Falta a lógica para obter o ID do usuário logado */
      const evento = await prisma.evento.findUnique({
        where: { id: Number(id), criadorId: usuarioLogadoId },
      });

      if (!evento) {
        res.status(404).json({ error: 'Evento não encontrado' });
        return;
      }

      // Adicionar aqui a validação se o usuário convidado existe e não foi convidado

      const convite = await prisma.convidado.create({
        data: {
          evento: { connect: { id: Number(id) } },
          usuario: { connect: { id: Number(convidadoId) } },
        },
      });

      res.json(convite);
    } catch (error) {
      console.error('Erro ao convidar usuário:', error);
      res.status(500).json({ error: 'Erro ao convidar usuário' });
    }
  });

  // Cria um comentário em um evento pelo ID
app.post('/eventos/:id/comentarios', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { texto } = req.body;

    try {
      const usuarioLogadoId =  (req as any).usuarioLogadoId;
      const evento = await prisma.evento.findFirst({
        where: {
          OR: [
            { id: Number(id), criadorId: usuarioLogadoId },
            { id: Number(id), convidados: { some: { usuarioId: usuarioLogadoId } } },
          ],
        },
      });

      if (!evento) {
        res.status(404).json({ error: 'Evento não encontrado' });
        return;
      }

      const comentario = await prisma.comentario.create({
        data: {
          texto,
          usuario: { connect: { id: usuarioLogadoId } },
          evento: { connect: { id: Number(evento.id) } },
        },
});
res.json(comentario);
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      res.status(500).json({ error: 'Erro ao criar comentário' });
    }
  });




app.listen(PORT, () => {
  console.log(`Servidor Express iniciado na porta ${PORT}`);
});




