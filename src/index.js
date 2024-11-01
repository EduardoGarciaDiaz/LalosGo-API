const Dotenv = require('dotenv');
Dotenv.config();
const App = require('./app');

const PORT = process.env.SERVER_PORT || 3000

server = App.listen(PORT, '0.0.0.0', () => { 
    console.log(`Server listening on port:${PORT}/api/v1`)
})