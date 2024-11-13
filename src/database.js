const mongoose = require('mongoose');
const dotenv = require('dotenv')
dotenv.config();
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = encodeURIComponent(process.env.DB_PASSWORD);
const DB_NAME = process.env.DB_NAME; 
const DB_IP = process.env.DB_IP;
const DB_PORT = process.env.DB_PORT;
const DB_URL = process.env.DB_URL;

if (process.env.NODE_ENV == "development") {
    mongoose.connect(DB_URL)
    .then(db => console.log('Db is connected'))
    .catch(error => console.error('Error connecting to database:', error));
} else {
    mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_IP}:${DB_PORT}/${DB_NAME}`)
    .then(db => console.log('Db is connected'))
    .catch(error => console.error('Error connecting to database:', error));
}

