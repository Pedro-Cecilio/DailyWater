export function generateMlPerHour(dailyWater_ml:number, diferenceInHours:number){
    const mlPerHour = dailyWater_ml / diferenceInHours
    return mlPerHour
}
