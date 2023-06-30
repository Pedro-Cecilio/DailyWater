import { FastifyReply, FastifyRequest } from "fastify";
import { TokenRepository } from "../repositories/TokenReporitory";
import { jwtDecoded } from "../utils/jwtDecoded";

export async function checkIfTheTokenIsValid(request: FastifyRequest, reply: FastifyReply, next: () => void) {
    const token = request.headers.authorization?.split(' ')[1] as string
    const decodedToken = jwtDecoded(token)
    

    if (decodedToken.userId) {
        const tokenRepository = new TokenRepository()
        const isValid = await tokenRepository.isValid(decodedToken.userId, token)
        if(!isValid){
            return reply.status(401).send('Token inválido')
        }
    }
    next()
}