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
    async update(id:string,oldMl:number):Promise<any>{
       const updateIngestedWater =  await prisma.ingestedWater.update({
            where:{
                id:"16114f7e-04bf-4734-a278-120d2b2be706"
            },
            data:{
                ingestedWater_ml:oldMl
            }
        })
        return updateIngestedWater
    }
}
