# Sistema de Cuidadores - CAREGIVER ANYWHERE

## 🚀 Visão Geral

Sistema web que conecta famílias que precisam de cuidados com profissionais de saúde qualificados, oferecendo comunicação em tempo real via chat.

## ✨ Funcionalidades Principais

- **Chat em Tempo Real**: Comunicação instantânea entre usuários e profissionais
- **Cadastro de Profissionais**: Sistema especializado para cuidadores, enfermeiros e técnicos
- **Regra de Negócio**: Cuidadores não precisam de registro profissional (COREN)
- **Validação Robusta**: Sistema completo de validação de dados
- **Interface Responsiva**: Adaptável para diferentes dispositivos
- **Segurança**: Senhas criptografadas com bcrypt

## 🛠️ Tecnologias

### Backend
- **Node.js** + **Express.js** - Servidor web
- **Socket.IO** - Chat em tempo real
- **PostgreSQL** - Banco de dados
- **bcrypt** - Criptografia de senhas

### Frontend
- **HTML5** + **CSS3** + **JavaScript ES6+**
- **Socket.IO Client** - Cliente de chat
- **Material Icons** - Ícones

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
   createdb caregiver_db
   ```

4. **Inicie o servidor**
   ```bash
   npm start
   ```

5. **Acesse a aplicação**
   ```
   http://localhost:5000
   ```

## 📁 Estrutura do Projeto

```
├── backend/
│   ├── config/          # Configuração do banco
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
└── package.json         # Dependências
```

## 🚀 Como Usar

### Para Usuários (Famílias)
1. Clique em "Busco Profissional"
2. Faça login ou registre-se
3. Busque profissionais por cidade
4. Inicie uma conversa via chat
5. Receba dados do profissional

### Para Profissionais
1. Clique em "Sou Profissional"
2. Faça login ou registre-se
3. Complete seu perfil
4. Receba mensagens de usuários
5. Compartilhe seus dados profissionais

## 🔗 API Endpoints

### Usuários
- `POST /api/users/register` - Registrar usuário
- `POST /api/users/login` - Login de usuário

### Profissionais
- `POST /api/professionals/register` - Registrar profissional
- `POST /api/professionals/login` - Login de profissional
- `GET /api/professionals` - Listar profissionais
- `GET /api/professionals/:id` - Obter profissional por ID
- `PUT /api/professionals/:id` - Atualizar profissional
- `DELETE /api/professionals/:id` - Excluir profissional

### Sistema
- `GET /health` - Health check

## 💬 Chat em Tempo Real

### Eventos Socket.IO
- `login` - Login de usuário/profissional
- `send_message` - Enviar mensagem de usuário
- `send_professional_message` - Enviar mensagem de profissional
- `send_professional_data` - Compartilhar dados do profissional
- `receive_message` - Receber mensagem
- `receive_professional_data` - Receber dados do profissional

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Validação robusta de dados
- CORS configurado
- Tratamento de erros

## 📝 Licença

Este projeto foi desenvolvido para fins acadêmicos (TCC).

---

**Sistema de Cuidadores - CAREGIVER ANYWHERE**  
*Conectando famílias a profissionais de saúde qualificados*