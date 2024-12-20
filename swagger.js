const swaggerAutogen = require('swagger-autogen')

const doc = {
    info: {
        title: 'LalosGo API',
        description: 'LalosGo API built with Node.js'
    },
    host: 'localhost:3000'
}

const outputFile = './swagger-output.json'
const routes = ["./src/index.js"]

swaggerAutogen(outputFile, routes, doc)