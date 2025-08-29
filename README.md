# Sistema de Cuidadores

Sistema web que conecta usuários que precisam de cuidados com profissionais qualificados, oferecendo comunicação em tempo real via chat.

## 🚀 Características

- **Chat em Tempo Real**: Comunicação bidirecional entre usuários e profissionais
- **Segurança**: Senhas criptografadas com bcrypt
- **Validação Robusta**: Sistema completo de validação de dados
- **Interface Responsiva**: Adaptável para diferentes dispositivos
- **Arquitetura Modular**: Código organizado seguindo princípios SOLID

## 🛠️ Tecnologias

### Backend
- Node.js + Express.js
- Socket.IO (comunicação em tempo real)
- PostgreSQL
- bcrypt (criptografia)

### Frontend
- HTML5, CSS3, JavaScript ES6+
- Socket.IO Client
- Material Icons

## 📋 Pré-requisitos

- Node.js (versão 14+)
- PostgreSQL (versão 12+)
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd sistema-cuidadores
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o banco de dados**
   ```bash
   createdb sistema_cuidadores
   ```

4. **Configure as variáveis de ambiente**
   ```bash
   cp env.example .env
   # Edite o arquivo .env com suas configurações
   ```

5. **Inicie o servidor**
   ```bash
   npm start
   ```

## 📁 Estrutura do Projeto

```
├── backend/
│   ├── config/          # Configurações (banco de dados)
│   ├── controllers/     # Controladores da API
│   ├── models/          # Modelos de dados
│   ├── routes/          # Rotas da API
│   ├── services/        # Serviços (Socket.IO)
│   ├── utils/           # Utilitários
│   └── server.js        # Servidor principal
├── frontend/
│   ├── js/services/     # Serviços do frontend
│   ├── index.html       # Página principal
│   ├── style.css        # Estilos
│   └── script.js        # Script principal
└── env.example          # Exemplo de configuração
```

## 🔗 Endpoints da API

- `POST /api/users/register` - Registro de usuário
- `POST /api/users/login` - Login de usuário
- `POST /api/professionals/register` - Registro de profissional
- `POST /api/professionals/login` - Login de profissional
- `GET /health` - Health check do sistema

## 💬 Chat em Tempo Real

O sistema utiliza Socket.IO para comunicação em tempo real:

- **Login**: `socket.emit('login', { userId, type })`
- **Enviar mensagem**: `socket.emit('send_message', { fromUserId, toProfessionalId, message })`
- **Receber mensagem**: `socket.on('receive_message', callback)`

## 🚀 Deploy

Para produção, configure as variáveis de ambiente:

```bash
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_cuidadores
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
JWT_SECRET=seu_jwt_secret
```

## 📝 Licença


