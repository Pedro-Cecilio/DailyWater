import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../env";

export function jwtDecoded(token:string){
    const key = env.KEY_JWT
    const decoded = jwt.verify(token, key) as JwtPayload
    return decoded
}