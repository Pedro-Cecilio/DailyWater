import { FastifyReply, FastifyRequest } from "fastify"
import { prisma } from "../database/database"
import { jwtValidate } from "../utils/jwtValidate"
import moment from "moment"
import { generateDiferenceHours } from "../utils/generateDiferenceHours"
import { generateMlPerHour } from "../utils/generateMlPerHour"
import { CreateIngestedWaterRepository } from "../repositories/CreateIngestedWaterRepository"

export async function CheckIngestedWaterTodayExist(request: FastifyRequest, reply: FastifyReply, next: ()=> void){
    const token = request.headers.authorization?.split(' ')[1] as string
    const decodedToken = jwtValidate(token)
    const ingestedWater = await prisma.ingestedWater.findFirst({
        where:{
            user_id: decodedToken.userid,
            day: moment().format('DD-MM-YYYY')
        }
    })
    if(!ingestedWater){
        const user = await prisma.user.findFirst({
            where:{
                id: decodedToken.userid,
            }
        })
        if(user){
            const diferenceInHours = generateDiferenceHours(user.wake, user.sleep)
            const MlPerHour = generateMlPerHour(user.weight * 35, diferenceInHours)
            const createIngestedWaterRepository = new CreateIngestedWaterRepository()
            await createIngestedWaterRepository.createIngestedWater(user.id, MlPerHour, moment().format('DD-MM-YYYY'), 0)
        }else{
            return reply.status(404).send("User not found") 
        }
    }
    next()
   
}