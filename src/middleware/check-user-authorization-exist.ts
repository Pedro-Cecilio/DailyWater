import { FastifyReply, FastifyRequest } from "fastify";

export function checkUserAutorizationExist(request: FastifyRequest, reply: FastifyReply, next: ()=> void){
    const token = request.headers.authorization?.split(' ')[1]
    if(!token){
        return reply.status(401).send({msg: "Unauthorized"})
    }
    next()
}