import { FastifyRequest, FastifyReply } from 'fastify'
import { number, z } from 'zod'
import { generateJwt } from '../utils/generatejwt'
import { CreateUserRepository } from '../repositories/CreateUserRepository'
import { CreateDailyWaterRepository } from '../repositories/CreateDailyWaterRepository'
import { GetUserRepository } from '../repositories/GetUserRepository'
import { generateDiferenceHours } from '../utils/generateDiferenceHours'
import { CreateIngestedWaterRepository } from '../repositories/CreateIngestedWaterRepository'
import {generateMlPerHour} from '../utils/generateMlPerHour'
import moment from 'moment'
import { jwtValidate } from '../utils/jwtValidate'
import { prisma } from '../database/database'
import { UpdateIngestedWaterRepository } from '../repositories/UpdateIngestedWater'

export async function createUser(request: FastifyRequest, reply: FastifyReply) {
    const createUserSchema = z.object({
        email: z.string().email(),
        name: z.string(),
        password: z.coerce.string(),
        wake: z.string(),
        sleep: z.string(),
        weight: z.number()
    })
    const result = createUserSchema.safeParse(request.body)
    if (!result.success) {
        return reply.status(400).send({ error: "invalid data" })
    }
    const { email, name, password, sleep, wake, weight } = result.data

    try {
        const createUserRepository = new CreateUserRepository()
        const createDailyWaterRepository = new CreateDailyWaterRepository()
        const createIngestedWaterRepository = new CreateIngestedWaterRepository()

        const user = await createUserRepository.CreateUser(email, name, password, sleep, wake, weight)
        // return reply.send({email, name, password, sleep, wake, weight})

        const dataDailyWater = { userId: user.userId, dailyWater_ml: weight * 35 }
        await createDailyWaterRepository.createDailyWater(dataDailyWater)
        const diferenceInHours = generateDiferenceHours(wake, sleep)
        const mlPerHour = generateMlPerHour(dataDailyWater.dailyWater_ml, diferenceInHours)
        const now = moment().format('DD-MM-YYYY')

        await createIngestedWaterRepository.createIngestedWater(user.userId, mlPerHour, now, 0)


    } catch (error) {
        if (error instanceof Error)
            return reply.status(500).send({ error: error.message })
    }

    reply.status(201).send({ response: "Usuário criado com sucesso!" })
}
export async function login(request: FastifyRequest, reply: FastifyReply) {
    const loginSchema = z.object({
        email: z.string().email(),
        password: z.coerce.string()
    })
    const login = loginSchema.safeParse(request.body)
    if (!login.success) {
        return reply.status(400).send({ error: "invalid data" })
    }
    const { email, password } = login.data
    try {
        const getUserRepository = new GetUserRepository()
        const user = await getUserRepository.getUser(email, password)
        if (!user) {
            return reply.status(404).send('User not found')
        }
        const token = generateJwt(user.id)
        reply.header('Authorization', `Bearer ${token}`).send()

    } catch (error) {
        if (error instanceof Error) {
            reply.status(500).send(error.message)
        } else {
            reply.status(500).send("Erro ao efetuar login")
        }

    }
}
export async function updateIngestedWater(request: FastifyRequest, reply: FastifyReply) {

    const token = request.headers.authorization?.split(' ')[1] as string
    const decodedToken = jwtValidate(token)

    if(decodedToken.userId){
        console.log({ml:'teste'})
        const {ml}:{ml:string}= request.query as any
        const updateIngestedWater = new UpdateIngestedWaterRepository()

        try {
            const ingestedWater = await updateIngestedWater.get(decodedToken.userId)

            const oldMl = ingestedWater.ingestedWater_ml + Number(ml)

            const updateIngestedWaterResult = await updateIngestedWater.update(decodedToken.userId, Number(oldMl))

            reply.send(updateIngestedWaterResult)

        } catch (error) {
            reply.send(error)
        }
    }
    reply.send()
}
export async function getIngestedWater(request: FastifyRequest, reply: FastifyReply){
    const token = request.headers.authorization?.split(' ')[1] as string
    const decodedToken = jwtValidate(token)
    if(decodedToken.userid){
        const ingestedWater = await prisma.ingestedWater.findFirst({
            where:{
                user_id: decodedToken.userid,
                day: moment().format('DD-MM-YYYY')
            }
        })

        return reply.status(200).send({ingestedWater_ml: ingestedWater?.ingestedWater_ml})
    }
}
export async function getDailyWater(request: FastifyRequest, reply: FastifyReply){
    const token = request.headers.authorization?.split(' ')[1] as string
    const decodedToken = jwtValidate(token)
    if(decodedToken.userid){
        const dailyWater = await prisma.dailyWater.findFirst({
            where:{
                user_id: decodedToken.userid
            }
        })
        if(dailyWater){
            return reply.status(200).send({dailyWater: dailyWater.dailyWater_ml})
        }
        reply.status(404).send("Daily water not found")
    }
}
export async function getWaterSchedule(request: FastifyRequest, reply: FastifyReply){
    const token = request.headers.authorization?.split(' ')[1] as string
    const decodedToken = jwtValidate(token)
    if(decodedToken.userid){
        const user = await prisma.user.findFirst({
            where:{
                id: decodedToken.userid
            }
        })
        if(user){
            const diferenceInHours = generateDiferenceHours(user.wake, user.sleep)
            console.log(diferenceInHours)
        }
    }
}
