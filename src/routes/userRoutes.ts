import { FastifyInstance } from 'fastify'
import { createUser, getDailyWater, getIngestedWater, getWaterSchedule, login, logout, updateIngestedWater } from '../controllers/userController'
import { checkUserAutorizationExist } from '../middleware/check-user-authorization-exist'
import { CheckIngestedWaterTodayExist } from '../middleware/check-ingested-water-today-exist'
import { checkIfTheTokenIsValid } from '../middleware/check-if-the-token-is-valid'

export async function User(app: FastifyInstance) {
    app.post('/', createUser)
    app.post('/login', login)
    app.put('/ingestedWater', {
        preHandler: [checkUserAutorizationExist, checkIfTheTokenIsValid, CheckIngestedWaterTodayExist]
    }, updateIngestedWater)
    app.get('/ingestedWater', {
        preHandler: [checkUserAutorizationExist, checkIfTheTokenIsValid, CheckIngestedWaterTodayExist]
    }, getIngestedWater)
    app.get('/dailyWater', {
        preHandler: [checkUserAutorizationExist, checkIfTheTokenIsValid,]
    }, getDailyWater)
    app.get('/WaterSchedule', {
        preHandler: [checkUserAutorizationExist, checkIfTheTokenIsValid,]
    }, getWaterSchedule)
    app.post('/logout', {
        preHandler: [checkUserAutorizationExist, checkIfTheTokenIsValid,]
    }, logout)
}