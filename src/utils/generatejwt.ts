import { env } from "../env";
import jwt from 'jsonwebtoken'

export function generateJwt(userId: string){
    const payload = {userId}
    const token = jwt.sign(payload, env.KEY_JWT)
    return token
}