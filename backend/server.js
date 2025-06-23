const express = require('express');
const http = require('http');
const socketIo = require('socket.io'); // Importando o socket.io
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const professionalRoutes = require('./routes/professionalRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Inicializando o Socket.IO

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/professionals', professionalRoutes);

let usuariosConectados = {};
let profissionaisConectados = {};

// Gerenciar a conexão dos usuários
io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);

    socket.on('login', (data) => {
        if (data.type === 'user') {
            usuariosConectados[socket.id] = data.userId;
            console.log(`Usuário conectado: ${data.userId} com socket id: ${socket.id}`);
        } else if (data.type === 'professional') {
            profissionaisConectados[socket.id] = data.userId;
            console.log(`Profissional conectado: ${data.userId} com socket id: ${socket.id}`);
        }
    });

    // Receber mensagens e encaminhar para o profissional específico
    socket.on('send_message', (data) => {
    const { fromUserId, toProfessionalId, message } = data;

    console.log(`Enviando mensagem de usuário ${fromUserId} para profissional ${toProfessionalId}: ${message}`);

    for (let socketId in profissionaisConectados) {
        if (profissionaisConectados[socketId] === toProfessionalId) {
            io.to(socketId).emit('receive_message', {
                fromUserId,
                message
            });
            console.log(`Mensagem enviada ao profissional: ${toProfessionalId}`);
            break;
        }
    }
});

    // Desconectar o usuário ou profissional
    socket.on('disconnect', () => {
        // Remover usuário ou profissional desconectado
        for (let socketId in usuariosConectados) {
            if (socketId === socket.id) {
                delete usuariosConectados[socketId];
                console.log('Usuário desconectado:', socket.id);
                break;
            }
        }

        for (let socketId in profissionaisConectados) {
            if (socketId === socket.id) {
                delete profissionaisConectados[socketId];
                console.log('Profissional desconectado:', socket.id);
                break;
            }
        }
    });
});

// Inicializa o servidor
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
