import moment from 'moment'

export function generateDiferenceHours(wake:string, sleep:string):number{
    const horario1 = moment(wake, 'HH:mm');
    const horario2 = moment(sleep, 'HH:mm');

    const diferencaEmMinutos = horario2.diff(horario1, 'hours');
    
    return diferencaEmMinutos
}