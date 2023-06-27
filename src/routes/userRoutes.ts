import {FastifyInstance} from 'fastify'
import { createUser, getDailyWater, getIngestedWater, getWaterSchedule, login, updateIngestedWater } from '../controllers/userController'
import { checkUserAutorizationExist } from '../middleware/check-user-authorization-exist'
import { CheckIngestedWaterTodayExist } from '../middleware/check-ingested-water-today-exist'

export async function User(app: FastifyInstance){
    app.post('/', createUser)
    app.post('/login', login)
    app.put('/ingestedWater',{
        preHandler: [checkUserAutorizationExist, CheckIngestedWaterTodayExist]
    }, updateIngestedWater)
    app.get('/ingestedWater', {
        preHandler: [checkUserAutorizationExist, CheckIngestedWaterTodayExist]
    }, getIngestedWater)
    app.get('/dailyWater', {
        preHandler: [checkUserAutorizationExist]
    }, getDailyWater)
    app.get('/WaterSchedule', {
        preHandler: [checkUserAutorizationExist]
    }, getWaterSchedule)
}