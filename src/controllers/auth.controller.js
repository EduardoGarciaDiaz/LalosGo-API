const bcrpt = require('bcrypt');
const { generateToken } = require('../security/jwt');
const AuthServices = require('../services/auth.service');

let self = {}

self.login = async function (req, res, next) {
    try {
        const { username, password } = req.body;
        let data = await AuthServices.getUserLogin(username);

        if (data === null) {
            return res.status(404).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const match = await bcrpt.compare(password, data.password);

        if (!match) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        let token = generateToken(data.email, data.fullname, data.role);
        res.status(200).json({
            email: data.email,
            name: data.fullname,
            role: data.role,
            token: token
        })
    } catch (error) {
        next(error);
    }
}

module.exports = self;