import {FastifyRequest, FastifyReply} from 'fastify'

export async function hello(request:FastifyRequest , reply: FastifyReply){
    reply.send({msg: 'hello'})
}

export async function bye(request:FastifyRequest , reply: FastifyReply){
    reply.send({msg: 'bye'})
}