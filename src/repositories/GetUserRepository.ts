import { prisma } from "../database/database";

export class GetUserRepository{
    async getUser(email:string, password:string):Promise<any>{
        const user = await prisma.user.findFirst({
            where: {
                email,
                password
            }
        })
        return user
    }
}