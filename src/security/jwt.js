const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

const generateToken = (email, name, role) => {
    const token = jwt.sign({
        email,
        name,
        role,
        "iss": "LalosGoWebJWT",
        "aud": "LalosGoWebJWT"
    },
        jwtSecret, {
        expiresIn: '20m'
    })
    return token;
}

module.exports = {generateToken};