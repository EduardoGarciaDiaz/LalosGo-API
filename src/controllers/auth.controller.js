const bcrypt = require('bcrypt');
const { generateToken } = require('../security/jwt');
const UserService = require('../services/users.service');

let self = {}

self.login = async function (req, res, next) {
    try {
        const { username, password } = req.body;
        let data = await UserService.getUserLogin(username);

        if (data === null) {
            return res.status(404).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const match = await bcrypt.compare(password, data.password);

        if (!match) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        let token = generateToken(data.email, data.fullname, data.role);
        res.status(200).json({
            email: data.email,
            fullname: data.fullname,
            role: data.role,
            token: token
        })
    } catch (error) {
        next(error);
    }
}

module.exports = self;