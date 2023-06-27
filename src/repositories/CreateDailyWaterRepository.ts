import { prisma } from "../database/database";


export class CreateDailyWaterRepository{
    async createDailyWater(dataDailyWater:any):Promise<any>{
        const dailyWater = await prisma.dailyWater.create({
            data: {
                user_id: dataDailyWater.userId,
                dailyWater_ml: dataDailyWater.dailyWater_ml
            }
        })
    }
}