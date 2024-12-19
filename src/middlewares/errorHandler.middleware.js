const fs = require('fs');
const requestIp = require('request-ip');

const errorHandler = (err, req, res, next) => {
    let message = 'No se ha podido procesar la petición. Inténtelo de nuevo más tarde.';
    const statusCode = err.status || 500;
    const ip = requestIp.getClientIp(req);

    let user = 'Anónimo';

    if (req.decodedToken) {
        user = req.decodedToken.username;
    }

    fs.appendFile('logs/error.log', new Date() + ` - ${statusCode} - ${ip} - ${user} - ${(err.message || message)}\n`, (err) => {
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
    } else {
        res.status(statusCode).send({ message: message })
    }
}

module.exports = errorHandler