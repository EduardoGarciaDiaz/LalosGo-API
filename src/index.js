const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');

require('./database')

const PORT = process.env.SERVER_PORT || 3000

server = app.listen(PORT, '0.0.0.0', () => { 
    console.log(`Server listening on port:${PORT}/api/v1`)
})