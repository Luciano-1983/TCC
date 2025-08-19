# Sistema de Cuidadores - CAREGIVER ANYWHERE

## 🚀 Visão Geral

Sistema de Cuidadores é uma plataforma web que conecta usuários que precisam de cuidados com profissionais qualificados. A aplicação segue os princípios SOLID e boas práticas de programação.

## ✨ Características

- **Arquitetura Modular**: Código organizado em módulos com responsabilidades únicas
- **Comunicação em Tempo Real**: Chat bidirecional entre usuários e profissionais
- **Segurança**: Senhas criptografadas com bcrypt
- **Validação Robusta**: Sistema completo de validação de dados
- **Responsivo**: Interface adaptável para diferentes dispositivos
- **Escalável**: Arquitetura preparada para crescimento

## 🏗️ Arquitetura

### Backend
```
backend/
├── config/
│   └── database.js          # Configuração de banco de dados
├── services/
│   └── SocketService.js     # Serviço de Socket.IO
├── utils/
│   ├── passwordUtils.js     # Utilitários de senha
│   └── ValidationUtils.js   # Utilitários de validação
├── models/                  # Modelos de dados
├── controllers/             # Controladores
├── routes/                  # Rotas da API
└── server.js               # Servidor principal
```

### Frontend
```
frontend/
├── js/
│   └── services/
│       ├── SocketService.js  # Serviço de Socket.IO
│       ├── ApiService.js     # Serviço de API
│       └── StorageService.js # Serviço de armazenamento
├── index.html
├── style.css
└── script.js               # Script principal
```

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Socket.IO** - Comunicação em tempo real
- **PostgreSQL** - Banco de dados
- **bcrypt** - Criptografia de senhas
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização
- **JavaScript ES6+** - Lógica
- **Socket.IO Client** - Cliente Socket.IO
- **Material Icons** - Ícones

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- PostgreSQL (versão 12 ou superior)
- npm ou yarn

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd sistema-cuidadores
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados
```bash
# Crie um banco de dados PostgreSQL
createdb sistema_cuidadores

# Ou use o nome que preferir e atualize a configuração
```

### 4. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

### 5. Configure o banco de dados
```bash
# As tabelas serão criadas automaticamente na primeira execução
# Ou execute manualmente os scripts SQL se necessário
```

### 6. Inicie o servidor
```bash
npm start
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=caregiver_db
DB_USER=postgres
DB_PASSWORD=nova_senha

# Configurações do Servidor
PORT=5000
NODE_ENV=development

# Configurações de CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000

# Configurações de Segurança
JWT_SECRET=seu_jwt_secret_aqui
BCRYPT_ROUNDS=12
```

### Banco de Dados

O sistema usa PostgreSQL. Certifique-se de:

1. Ter o PostgreSQL instalado e rodando
2. Criar um banco de dados
3. Configurar as credenciais no arquivo `.env`

## 🚀 Uso

### 1. Acesse a aplicação
```
http://localhost:5000
```

### 2. Como Usuário
1. Clique em "Busco Profissional"
2. Faça login ou registre-se
3. Busque profissionais por cidade
4. Inicie uma conversa
5. Receba dados do profissional

### 3. Como Profissional
1. Clique em "Sou Profissional"
2. Faça login ou registre-se
3. Complete seu perfil
4. Receba mensagens de usuários
5. Compartilhe seus dados profissionais

## 🔧 Desenvolvimento

### Estrutura de Comandos

```bash
# Iniciar em modo desenvolvimento
npm run dev

# Iniciar em modo produção
npm start


### Padrões de Código

- Siga os princípios SOLID
- Use comentários em português
- Documente todos os métodos
- Mantenha responsabilidades únicas
- Use tratamento de erros robusto

## 📊 API Endpoints

### Usuários
- `POST /api/users/register` - Registrar usuário
- `POST /api/users/login` - Login de usuário

### Profissionais
- `POST /api/professionals/register` - Registrar profissional
- `POST /api/professionals/login` - Login de profissional
- `GET /api/professionals/search` - Buscar profissionais
- `GET /api/professionals/:id` - Obter profissional por ID
- `PUT /api/professionals/:id` - Atualizar profissional
- `DELETE /api/professionals/:id` - Excluir profissional

### Sistema
- `GET /health` - Health check

## 🔌 Socket.IO Events

### Cliente → Servidor
- `login` - Login de usuário/profissional
- `send_message` - Enviar mensagem de usuário
- `send_professional_message` - Enviar mensagem de profissional
- `send_professional_data` - Enviar dados do profissional

### Servidor → Cliente
- `receive_message` - Receber mensagem
- `receive_professional_data` - Receber dados do profissional

## 📈 Monitoramento

### Logs
- Logs estruturados com níveis
- Rotação automática de arquivos
- Diferentes níveis para desenvolvimento/produção

### Métricas
- Estatísticas de conexões Socket.IO
- Performance de queries
- Uso de memória e CPU

### Health Check
- Endpoint `/health` para monitoramento
- Verificação de conectividade com banco
- Status dos serviços

## 🔒 Segurança

### Implementado
- Criptografia de senhas com bcrypt
- Validação robusta de entrada
- Sanitização de dados
- CORS configurado
- Headers de segurança

### Recomendações para Produção
- Use HTTPS
- Configure rate limiting
- Implemente autenticação JWT
- Use variáveis de ambiente para secrets
- Configure firewall
- Monitore logs de segurança

## 🚀 Deploy

### Produção
1. Configure variáveis de ambiente
2. Use PM2 ou similar para gerenciar processos
3. Configure nginx como proxy reverso
4. Use SSL/TLS
5. Configure backup do banco de dados


## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Siga os padrões de código
4. Escreva testes
5. Documente mudanças
6. Faça pull request

### Padrões de Commit
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de manutenção
```

### v2.0.0 (Dezembro 2024)
- ✅ Arquitetura modular
- ✅ Serviços especializados
- ✅ Validação robusta
- ✅ Documentação completa
- ✅ Tratamento de erros
- ✅ Logging estruturado

---

**Desenvolvido pela equipe Sistema de Cuidadores** 