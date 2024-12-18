const fs = require('fs');
const requestIp = require('request-ip');

const errorHandler = (err, req, res, next) => {
    let mensaje = 'No se ha podido procesar la petición. Inténtelo de nuevo más tarde.';
    const statusCode = err.status || 500;
    const ip = requestIp.getClientIp(req);

    let usuario = 'Anónimo';

    if (req.decodedToken) {
        usuario = req.decodedToken.email;
    }

    fs.appendFile('logs/error.log', new Date() + ` - ${statusCode} - ${ip} - ${usuario} - ${err.message || mensaje}\n`, (err) => {
        if (err) {
            console.log(err);
        }
    })

    if (process.env.NODE_ENV === 'development') {
        mensaje = err.message || mensaje

        res.status(statusCode).json({
            status: statusCode,
            mensaje: mensaje,
            stack: err.stack
        })
    } else {
        res.status(statusCode).send({ mensaje: mensaje })
    }
}

module.exports = errorHandler