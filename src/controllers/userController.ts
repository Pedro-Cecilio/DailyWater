import {FastifyRequest, FastifyReply} from 'fastify'
import { prisma } from '../database/database'
import { z } from 'zod'

export async function createUser(request:FastifyRequest , reply: FastifyReply){
    const createUserSchema = z.object({
        email: z.string().email(),
        name: z.string(),
        password: z.coerce.string(),
        wake: z.string(),
        sleep: z.string(),
        weight: z.number()
    })
    const result = createUserSchema.safeParse(request.body)
    if(!result.success){
        return reply.status(400).send({error: "invalid data"})
    }
    const {email, name, password, sleep, wake, weight} = result.data
    try {
        const user = await prisma.user.create({
            data: {
                email: email,
                name: name,
                password: password,
                sleep: sleep,
                wake: wake,
                weight: weight
            }
        })
        const dailyWater = await prisma.dailyWater.create({
            data: {
                user_id: user.id,
                dailyWater_ml: user.weight * 35
            }
        })
    } catch (error) {
        return reply.status(500).send({error})
    }
    
    reply.status(201).send({response: "Usuário criado com sucesso!"})
}

export async function bye(request:FastifyRequest , reply: FastifyReply){
    reply.send({msg: 'bye'})
}