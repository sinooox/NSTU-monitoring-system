import socket
import json
import os
import threading
import time

server_host = '172.17.9.247'
server_port = 65432

json_file = 'computers.json'
timers = {}


def update_status_off(computer_name):
    if os.path.exists(json_file):
        with open(json_file, 'r') as file:
            try:
                computers = json.load(file)
            except json.JSONDecodeError:
                computers = []
    else:
        computers = []

    for item in computers:
        if item["computer_name"] == computer_name:
            item["pc_status"] = "pcOff"
            print(f'Статус компьютера {item["computer_name"]} обновлен на pcOff.')
            break

    with open(json_file, 'w') as file:
        json.dump(computers, file, indent=4)


def reset_timer(computer_name, status):
    if computer_name in timers:
        timers[computer_name].cancel()
    timers[computer_name] = threading.Timer(
        20, update_status_off, [computer_name])
    timers[computer_name].start()

    if os.path.exists(json_file):
        with open(json_file, 'r') as file:
            try:
                computers = json.load(file)
            except json.JSONDecodeError:
                computers = []
    else:
        computers = []

    updated = False
    for item in computers:
        if item["computer_name"] == computer_name:
            item["pc_status"] = status
            updated = True
            break

    if not updated:
        computers.append({"computer_name": computer_name, "pc_status": status})

    with open(json_file, 'w') as file:
        json.dump(computers, file, indent=4)


with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((server_host, server_port))
    s.listen()

    print('Сервер запущен и ждет подключения...')

    while True:
        conn, addr = s.accept()
        with conn:
            print(f'Подключение от {addr}')
            data = conn.recv(1024)

            if not data:
                break

            computer_name = data.decode('utf-8')
            data_list = json.loads(computer_name)

            reset_timer(data_list[0], data_list[1])

            print(f'Статус компьютера {data_list[0]} обновлен на {data_list[1]}.')
