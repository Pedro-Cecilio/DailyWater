import { prisma } from "../database/database";

export class CreateIngestedWaterRepository{
    async createIngestedWater(userId:string, MlPerHour:number, day:string, ingestedWaterMl?:number){
        const result = await prisma.ingestedWater.create({
            data:{
                user_id: userId,
                waterPerHour: MlPerHour,
                ingestedWater_ml: ingestedWaterMl,
                day
            }
        })
        return result 
    }
}