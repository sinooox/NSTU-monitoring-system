<script>

import axios from 'axios';
import {io} from 'socket.io-client';
export default {
    data() {
        return {
            computers: [] // Массив объектов с данными о компьютерах
        }
    },
    mounted() {
        this.download_data();
        this.setupSocket();
    },
    methods: {
        async download_data() {
            try {
                const response = await axios.get('http://localhost:3000/get-data'); // Обращение к вашему Node.js серверу
                if (response.status === 200) {
                    this.computers = response.data.map(pc => {
                        return {
                            name: pc.computer_name,
                            image: pc.pc_status === 'pcOn' ? 'pcOn.svg' : 'pcOff.svg'
                        };
                    });
                } else {
                    throw new Error('Ошибка получения данных');
                }
            } catch (error) {
                console.error('Ошибка при получении данных:', error);
            }
        },
        setupSocket() {
            const socket = io('http://localhost:3000'); // Подключитесь к серверу

            socket.on('data-update', (data) => {
                this.computers = data.map(pc => {
                    return {
                        name: pc.computer_name,
                        image: pc.pc_status === 'pcOn' ? 'pcOn.svg' : 'pcOff.svg'
                    };
                });
            });

            socket.on('error', (error) => {
                console.error('Ошибка:', error);
            });
        }
    }
}
</script>

<template>
    <div id="app">
        <h1>Мониторинг ПК</h1>
        <main>
            <div class="container">
                <div class="row">
                    <div v-for="(src, index) in computers" 
                         class="col-sm-1">
                        <img :src="'src/assets/' + src.image" :alt="src.name" class="img-fluid">
                        <p>Компютер {{ src.name }}</p>
                    </div>
                </div>
            </div>
        </main>
        <footer>
            <div class="footer-container">
                <div class="email" style="float: right;">
                    <h3>Email адреса для связи</h3>
                    <p>vanroz333@gmail.com</p>
                    <p>info@example.com</p>
                </div>
                <div class="phones" style="float: left;">
                    <h3>Телефоны для связи</h3>
                    <p>+1 234 567 890</p>
                    <p>+1 987 654 321</p>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
h1{
    margin-left: auto;
    margin-right: auto;
}
    html, body {
        height: 100%;
        margin: 0;
    }
    img {
        width: 100%; /* Делает изображение адаптивным */
        height: auto; /* Сохраняет пропорции */
    }
    .footer-container {
        display: flex;
        justify-content: space-between;
        padding: 10px;
    }
    #app {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    .row {
    display: flex;
    flex-wrap: wrap;
}
.col-sm-1 {
    position: relative;
    margin: 0 5px;
}
.col-sm-1 p{
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    font-size: 13px;
}
/* Добавление ограничения на количество элементов в строке */
.row > div {
    max-width: calc((100% / 9) - 10px); /* Учитывает пространство между элементами */
}
</style>
