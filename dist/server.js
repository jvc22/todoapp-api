import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import { utcToZonedTime } from "date-fns-tz";
import { startOfDay, endOfDay } from "date-fns";
const server = fastify();
await server.register(fastifyCors, {
    origin: 'http://localhost:5173'
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
            descr
        }
    });
    if (task) {
        res.status(201).send({ message: 'Task successfully created.' });
    }
    res.status(404).send({ message: 'Task was not created due to an error.' });
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
    port: 3333,
});
