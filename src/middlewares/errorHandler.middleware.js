const fs = require('fs');
const requestIp = require('request-ip');
const dotenv = require('dotenv');
dotenv.config();

const errorHandler = (err, req, res, next) => {
    let message = 'No se ha podido procesar la petición. Inténtelo de nuevo más tarde.';
    const statusCode = err.status || 500;
    const ip = requestIp.getClientIp(req);

    let email = 'Anónimo';

    if (req.decodedToken) {
        email = req.decodedToken.email;
    }

    fs.appendFile('logs/error.log', new Date() + ` - ${statusCode} - ${ip} - ${email} - ${(err.message || message)}\n`, (err) => {
        if (err) {
            console.log(err)
        }
    })

    if (process.env.NODE_ENV === 'development') {
        message = err.message || message

        res.status(statusCode).json({
            status: statusCode,
            message: message,
            stack: err.stack
        })
        console.log(err)
    } else {
        res.status(statusCode).send({ message: message })
    }
}

module.exports = errorHandler;