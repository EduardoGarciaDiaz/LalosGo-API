const dotenv = require('dotenv');
const app = require('./app');
const v1Router = require("./v1/routes")
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('../swagger-output.json')
const cors = require('cors');
dotenv.config();
require('./database')

const PORT = process.env.SERVER_PORT || 3000
const GRPC_PORT = process.env.GRPC_PORT || 3001

app.use(cors());

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/api/v1", v1Router)
app.get('*', (req, res) => { res.status(404).send("Recurso no encontrado") })


const errorhandler = require('./middlewares/errorHandler.middleware')
app.use(errorhandler)

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port:${PORT}/api/v1`)
})



module.exports = {
    server    
}