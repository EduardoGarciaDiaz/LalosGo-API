const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const v1Router = require("./v1/routes")
const cors = require('cors');




require('./database')

const PORT = process.env.SERVER_PORT || 3000
const GRPC_PORT = process.env.GRPC_PORT || 3001

app.use(cors());


app.use("/api/v1", v1Router)
app.use('*', (req, res) => { res.status(404).send()})

server = app.listen(PORT, '0.0.0.0', () => { 
    console.log(`Server listening on port:${PORT}/api/v1`)
})



module.exports = {
    server    
}