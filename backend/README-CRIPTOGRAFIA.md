# Implementação de Criptografia de Senhas com bcrypt

## Resumo das Mudanças

Este documento descreve as modificações implementadas para adicionar criptografia de senhas usando bcrypt no sistema.

## Arquivos Modificados

### 1. Novo Arquivo: `utils/passwordUtils.js`
- **Função**: Utilitário centralizado para criptografia e verificação de senhas
- **Métodos**:
  - `hashPassword(password)`: Criptografa uma senha usando bcrypt
  - `comparePassword(password, hashedPassword)`: Verifica se uma senha corresponde ao hash

### 2. Modelo de Usuário: `models/userModel.js`
- **Mudanças**:
  - Adicionado import do `PasswordUtils`
  - Método `create()` agora criptografa a senha antes de salvar
  - Substituído `findUserByEmailAndPassword()` por `findUserByEmail()`
  - Adicionado método `verifyPassword()` para verificação de senha

### 3. Modelo de Profissional: `models/professionalModel.js`
- **Mudanças**:
  - Adicionado import do `PasswordUtils`
  - Método `createProfessional()` agora criptografa a senha antes de salvar
  - Substituído `findProfessionalByEmailAndPassword()` por `findProfessionalByEmail()`
  - Adicionado método `verifyPassword()` para verificação de senha
  - Método `update()` agora criptografa a senha quando fornecida

### 4. Controlador de Usuário: `controllers/userController.js`
- **Mudanças**:
  - Método `login()` agora busca usuário por email e verifica senha separadamente
  - Implementada verificação segura de senha usando bcrypt

### 5. Controlador de Profissional: `controllers/professionalController.js`
- **Mudanças**:
  - Método `login()` agora busca profissional por email e verifica senha separadamente
  - Implementada verificação segura de senha usando bcrypt

## Dependências Adicionadas

- **bcrypt**: Biblioteca para criptografia de senhas
  - Versão: ^6.0.0
  - Instalada via: `npm install bcrypt --save`

## Como Funciona

### Criptografia de Senha
1. Quando um usuário ou profissional se cadastra, a senha é criptografada usando bcrypt
2. O hash gerado é único mesmo para a mesma senha (devido ao salt)
3. Apenas o hash é armazenado no banco de dados

### Verificação de Senha
1. Durante o login, o sistema busca o usuário/profissional pelo email
2. A senha fornecida é comparada com o hash armazenado usando bcrypt.compare()
3. Se a senha estiver correta, o login é autorizado

## Benefícios de Segurança

1. **Senhas não são armazenadas em texto plano**
2. **Salt único**: Cada hash é único, mesmo para senhas idênticas
3. **Resistente a ataques**: bcrypt é computacionalmente intensivo
4. **Padrão da indústria**: bcrypt é amplamente utilizado e testado

## Migração de Dados Existentes

⚠️ **IMPORTANTE**: Se existem usuários ou profissionais cadastrados com senhas em texto plano, será necessário:

1. Implementar uma migração para criptografar senhas existentes
2. Ou solicitar que os usuários redefinam suas senhas no próximo login

## Testes Realizados

- ✅ Criptografia de senha funciona corretamente
- ✅ Verificação de senha correta retorna true
- ✅ Verificação de senha incorreta retorna false
- ✅ Hashes são únicos para a mesma senha
- ✅ Ambos os hashes verificam corretamente

## Configuração

O bcrypt está configurado com:
- **Salt Rounds**: 10 (padrão recomendado)
- **Algoritmo**: bcrypt (versão 2b)

Esta configuração oferece um bom equilíbrio entre segurança e performance. 