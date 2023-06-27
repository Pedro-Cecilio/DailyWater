import {FastifyInstance} from 'fastify'
import { hello, bye } from '../controllers/testController'

export async function test(app: FastifyInstance){
    app.get('/', hello)
    app.get('/bye', bye)
}