const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const v1Router = require("./v1/routes")
const cors = require('cors');

require('./database')

const PORT = process.env.SERVER_PORT || 3000

app.use(cors());

const errorhandler = require('./middlewares/errorhandler.middleware')
app.use(errorhandler)

app.use("/api/v1", v1Router)
app.get('*', (req, res) => { res.status(404).send("Recurso no encontrado") })

server = app.listen(PORT, '0.0.0.0', () => { 
    console.log(`Server listening on port:${PORT}/api/v1`)
})

module.exports = server