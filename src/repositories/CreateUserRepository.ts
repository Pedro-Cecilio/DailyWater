import { prisma } from "../database/database";


export class CreateUserRepository{
    async CreateUser(email: string, name: string, password:string, sleep:string, wake:string, weight:number):Promise<any>{
    
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
        return {userId: user.id, weight}
    }
}
