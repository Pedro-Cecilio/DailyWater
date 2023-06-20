import {app} from './app'

app.listen({
    port: 5000
}).then(()=>{
    console.log('Sever running in http://localhost:5000')
})

