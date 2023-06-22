import {FastifyInstance} from 'fastify'
import { createUser, bye } from '../controllers/userController'

export async function User(app: FastifyInstance){
    app.post('/', createUser)
    app.get('/bye', bye)
}