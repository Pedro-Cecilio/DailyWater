import { prisma } from "../database/database";
import moment from "moment";
export class UpdateIngestedWaterRepository{
    async get(user_id:string):Promise<any>{
        const ingestedWater = await prisma.ingestedWater.findFirst({
            where: {
               user_id:user_id,
               day: moment().format('DD-MM-YYYY')
            }
        })

        return ingestedWater
    }
    async update(id:string,newMl:number):Promise<any>{
       const updateIngestedWater =  await prisma.ingestedWater.update({
            where:{
                id: id
            },
            data:{
                ingestedWater_ml: newMl
            }
        })
        return updateIngestedWater
    }
}
