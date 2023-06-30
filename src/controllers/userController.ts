import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { generateJwt } from '../utils/generatejwt'
import { CreateUserRepository } from '../repositories/CreateUserRepository'
import { CreateDailyWaterRepository } from '../repositories/CreateDailyWaterRepository'
import { GetUserRepository } from '../repositories/GetUserRepository'
import { generateDiferenceHours } from '../utils/generateDiferenceHours'
import { CreateIngestedWaterRepository } from '../repositories/CreateIngestedWaterRepository'
import { generateMlPerHour } from '../utils/generateMlPerHour'
import moment from 'moment'
import { jwtDecoded } from '../utils/jwtDecoded'
import { prisma } from '../database/database'
import { UpdateIngestedWaterRepository } from '../repositories/UpdateIngestedWater'
import { TokenRepository } from '../repositories/TokenReporitory'

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
        const tokenRepository = new TokenRepository()
        const existValidToken = await tokenRepository.checkIfExistValidByUserId(user.id)
        if(existValidToken){
            return reply.status(401).send({msg:"O usuário já está logado"})
        }
        const token = generateJwt(user.id)
        reply.header('Authorization', `Bearer ${token}`).send()
        await tokenRepository.CreateValidToken(user.id, token)

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
    const decodedToken = jwtDecoded(token)
    
    if (decodedToken.userId) {
        const { ml }: { ml: string } = request.query as any
        const updateIngestedWater = new UpdateIngestedWaterRepository()

        try {
            const ingestedWater = await updateIngestedWater.get(decodedToken.userId)

            const newMl = ingestedWater.ingestedWater_ml + Number(ml)

            await updateIngestedWater.update(ingestedWater.id, Number(newMl))
        } catch (error) {
            reply.status(444).send(error)
        }
    }
    reply.status(204).send()
}
export async function getIngestedWater(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(' ')[1] as string
    const decodedToken = jwtDecoded(token)
    if (decodedToken.userId) {
        const ingestedWater = await prisma.ingestedWater.findFirst({
            where: {
                user_id: decodedToken.userId,
                day: moment().format('DD-MM-YYYY')
            }
        })

        return reply.status(200).send({ ingestedWater_ml: ingestedWater?.ingestedWater_ml })
    }
}
export async function getDailyWater(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(' ')[1] as string
    const decodedToken = jwtDecoded(token)
    if (decodedToken.userId) {
        const dailyWater = await prisma.dailyWater.findFirst({
            where: {
                user_id: decodedToken.userId
            }
        })
        if (dailyWater) {
            return reply.status(200).send({ dailyWater: dailyWater.dailyWater_ml })
        }
        reply.status(404).send("Daily water not found")
    }
}
export async function getWaterSchedule(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(' ')[1] as string
    const decodedToken = jwtDecoded(token)
    if (decodedToken.userId) {
        const user = await prisma.user.findFirst({
            where: {
                id: decodedToken.userId
            }
        })
        
        if (user) {
            const schedule = []
            // const diferenceInHours = generateDiferenceHours(user.wake, user.sleep)
            let momentWake = moment(user.wake, 'HH:mm')
            let momentSleep = moment(user.sleep, 'HH:mm')
            // console.log(diferenceInHours)
            while (momentWake.isBefore(momentSleep)) {
                momentWake.add(1, 'hour')

                if(momentWake.isBefore(momentSleep)){
                    schedule.push(momentWake.format('HH:mm'))
                }else{
                    const lasthourFromSchedule = moment(schedule[schedule.length -1], 'HH:mm')
                    if(momentSleep.diff(lasthourFromSchedule, 'minutes') >= 30){
                        schedule.push(momentSleep.subtract(10, 'minutes').format('HH:mm'))
                    }
                }
                

            }

            return reply.status(200).send(schedule)
        }
        return reply.status(404).send('User not found')
    }
    return reply.status(500).send('userId not found')
}
export async function logout(request: FastifyRequest, reply: FastifyReply){
    const token = request.headers.authorization?.split(' ')[1] as string
    const decodedToken = jwtDecoded(token)
    if (decodedToken.userId) {
        const tokenRepository = new TokenRepository()
        await tokenRepository.invalidateToken(decodedToken.userId, token)
    }
}
