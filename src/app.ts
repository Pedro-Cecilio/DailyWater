import fastity from 'fastify'
import { User } from './routes/userRoutes'


export const app = fastity()

app.register(User)