const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const jwtSecret = process.env.JWT_SECRET;
const { generateToken } = require('../security/jwt');

const authorize = (rol) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.header('Authorization');
            const error = new Error('Unauthorized');
            error.status = 401;

            if (!authHeader.startsWith('Bearer ')) {
                return next(error);
            }

            const token = authHeader.split(' ')[1];
            const decodedToken = jwt.verify(token, jwtSecret);
            
            if (rol.split(',').indexOf(decodedToken.role) == -1) {
                return next(error);
            }

            req.decodedToken = decodedToken;

            var minutesLeft = (decodedToken.exp - (new Date().getTime() / 1000)) / 60;
            if (minutesLeft < 5) {
                var newToken = generateToken(decodedToken.id, decodedToken.email, decodedToken.name, decodedToken.role);
                res.header("Set-Authorization", newToken);
            }

            next()
        } catch (error) {
            error.status = 401;
            next(error);
        }
    }
}

module.exports = authorize;