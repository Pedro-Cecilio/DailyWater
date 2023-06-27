import fastity from 'fastify'
import { test } from './routes/testRouter'


export const app = fastity()

app.register(test)