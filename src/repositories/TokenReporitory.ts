import { prisma } from "../database/database";

export class TokenRepository{
    async CreateValidToken(user_id:string, token:string){
        try {
            await prisma.tokenValidity.create({
                data: {
                    user_id,
                    token,
                    isValid: true
                }
            })
        } catch (error) {
            if (error instanceof Error)
                throw new Error(error.message)
        }
    }
    
    async checkIfExistValidByUserId(user_id:string){
        try {
            const result = await prisma.tokenValidity.findFirst({
                where:{
                    user_id,
                    isValid: true
                }
            })
            if(result){
                return result.isValid
            }
            return false
            
        } catch (error) {
            if(error instanceof Error)
                throw new Error(error.message)
            
        }
        
    }
    async isValid(user_id:string, token:string){
        
        try {
            const result = await prisma.tokenValidity.findFirst({
                where:{
                    user_id,
                    token,
                    isValid: true
                }
            })
            if(result){
                return true
            }
            return false
        } catch (error) {
            if(error instanceof Error)
                throw new Error(error.message)
            
        }
    }

    async invalidateToken(user_id:string, token:string){
        try {
            const result = await prisma.tokenValidity.findFirst({
                where:{
                    user_id,
                    token
                }
            })
            await prisma.tokenValidity.update({
                where: {
                    id: result?.id,
                },
                data:{
                    isValid: false
                }
            })
            
        } catch (error) {
            if(error instanceof Error)
                throw new Error(error.message)
            
        }
    }
    
}