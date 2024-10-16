// server.js
import express from 'express';
import { Client } from 'ssh2';
import cors from 'cors';
import http from 'http'; // Добавляем http для создания сервера
import { Server } from 'socket.io'; // Импортируем socket.io

const app = express();
const server = http.createServer(app); // Создаем HTTP сервер для работы с сокетами
const io = new Server(server); // Инициализируем socket.io с созданным сервером

app.use(cors());
const PORT = 3000;

// Эндпоинт для получения данных через обычный HTTP запрос
app.get('/get-data', (req, res) => {
    const conn = new Client();
    conn.on('ready', () => {
        console.log('SSH Connection established.');
        conn.exec('cat /home/compi/computers.json', (err, stream) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Ошибка выполнения команды');
            }
            let data = '';
            stream.on('close', (code, signal) => {
                console.log(`Stream :: close :: code: ${code}, signal: ${signal}`);
                conn.end();
                try {
                    const jsonData = JSON.parse(data);
                    res.json(jsonData); // Возвращаем данные в виде JSON
                } catch (parseError) {
                    console.error(parseError);
                    res.status(500).send('Ошибка парсинга JSON');
                }
            }).on('data', (chunk) => {
                data += chunk;
            }).stderr.on('data', (chunk) => {
                console.error(`STDERR: ${chunk}`);
            });
        });
    }).connect({
        host: '217.71.129.139',
        port: 4324,
        username: 'root',
        password: '0wh7fzlx'
    });
});

// Настройка сокетов для отправки данных в реальном времени
io.on('connection', (socket) => {
    console.log('Client connected via WebSocket');

    // Функция для отправки данных клиенту через сокеты
    const sendData = async () => {
        const conn = new Client();
        conn.on('ready', () => {
            console.log('SSH Connection established for WebSocket.');
            conn.exec('cat /home/compi/computers.json', (err, stream) => {
                if (err) {
                    console.error(err);
                    socket.emit('error', 'Ошибка выполнения команды');
                    return;
                }
                let data = '';
                stream.on('close', (code, signal) => {
                    console.log(`Stream :: close :: code: ${code}, signal: ${signal}`);
                    conn.end();
                    try {
                        const jsonData = JSON.parse(data);
                        socket.emit('data-update', jsonData); // Отправляем обновленные данные клиенту
                    } catch (parseError) {
                        console.error(parseError);
                        socket.emit('error', 'Ошибка парсинга JSON');
                    }
                }).on('data', (chunk) => {
                    data += chunk;
                }).stderr.on('data', (chunk) => {
                    console.error(`STDERR: ${chunk}`);
                });
            });
        }).connect({
            host: '217.71.129.139',
            port: 4324,
            username: 'root',
            password: '0wh7fzlx'
        });
    };

    // Отправляем данные сразу при подключении клиента
    sendData();

    // Отправляем обновления данных каждые 10 секунд
    const intervalId = setInterval(sendData, 10000);

    // Очищаем интервал при отключении клиента
    socket.on('disconnect', () => {
        console.log('Client disconnected');
        clearInterval(intervalId);
    });
});

// Запускаем сервер
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
