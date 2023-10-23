import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import { utcToZonedTime } from "date-fns-tz";
import { startOfDay, endOfDay } from "date-fns";
const server = fastify();
await server.register(fastifyCors, {
    origin: 'https://todo-jvcs.netlify.app'
});
const prisma = new PrismaClient({
    log: ['query'],
});
server.get('/task', async (req, res) => {
    const brTimeZone = 'America/Sao_Paulo';
    const today = utcToZonedTime(new Date(), brTimeZone);
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    const tasks = await prisma.task.findMany({
        where: {
            created_at: {
                gte: startOfToday,
                lte: endOfToday,
            }
        }
    });
    if (tasks) {
        res.status(200).send(tasks);
    }
    else {
        res.status(404).send({ message: 'No tasks found.' });
    }
});
server.post('/task', async (req, res) => {
    const { name, descr } = req.body;
    const task = await prisma.task.create({
        data: {
            name,
            descr,
            finished: false
        }
    });
    if (task) {
        res.status(201).send({ message: 'Task successfully created.' });
    }
    res.status(404).send({ message: 'Task was not created due to an error.' });
});
server.put('/task/:id', async (req, res) => {
    const { id } = req.params;
    const isFinished = await prisma.task.findUnique({
        where: {
            id,
        },
        select: {
            finished: true,
        }
    });
    const updateFinished = await prisma.task.update({
        where: {
            id,
        },
        data: {
            finished: !isFinished
        }
    });
    if (updateFinished) {
        res.status(200).send({ message: 'Task status successfully changed.' });
    }
    else {
        res.status(404).send({ message: 'Task was not updated due to an error.' });
    }
});
server.delete('/task/:id', async (req, res) => {
    const { id } = req.params;
    const deleted = await prisma.task.delete({
        where: {
            id,
        }
    });
    if (deleted) {
        res.status(200).send({ message: 'Task deleted successfully.' });
    }
    else {
        res.status(404).send({ message: 'Task was not deleted due to an error.' });
    }
});
server.listen({
    host: '0.0.0.0',
    port: process.env.PORT ?? 3333,
});
