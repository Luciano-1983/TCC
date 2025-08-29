const UserModel = require('../models/userModel');

const UserController = {

    register: async (req, res) => {
        const { nome, email, senha } = req.body;

        try {
            const user = await UserModel.create(nome, email, senha); 
            res.json(user);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Erro ao registrar usuário');
        }
    },

    login: async (req, res) => {
        const { email, senha } = req.body;

        try {
            const user = await UserModel.findUserByEmail(email); 

            if (user) {
                const isPasswordValid = await UserModel.verifyPassword(senha, user.senha);
                
                if (isPasswordValid) {
                    res.json(user);
                } else {
                    res.status(401).send('Credenciais inválidas');
                }
            } else {
                res.status(401).send('Credenciais inválidas');
            }
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Erro ao fazer login');
        }
    }
};

module.exports = UserController;

