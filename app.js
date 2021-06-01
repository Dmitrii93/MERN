const express = require('express'); //подключили модуль для облегчения создания и управления сервером
const config = require('config'); // подключили модуль config , который позволяет брать переменные из него установленные переменные по инструкциям. Связан с папкой config в корне. 
const mongoose = require('mongoose'); // Подключае MongoDB

const app = express();

const PORT = config.get('port') || 5000; // связь с config-данными

app.use('/api/auth',require('./routes/auth_routes'))


async function start() { // имеется работа с пормисами поэтому в асинхронной функции подключаемся к БД
    try {
        await mongoose.connect(config.get('mongoURI'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        app.listen(PORT, ()=>{
            console.log(`App has been started on port:${PORT}...`);
        })
    } catch(e) {
        console.log('Server error', e.message)
        process.exit(1) // выход из процесса NodeJS
    }
}
start();


