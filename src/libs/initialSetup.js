const dotenv = require('dotenv')
dotenv.config()
const bcrypt = require('bcrypt');
const User = require('../models/User')

const createAdmin = async () => {
    try {
        // Check if any user exists
        const userFound = await User.findOne({ 
            username: process.env.ADMIN_USERNAME || 'admin'
        })
        
        if (userFound) {
            return
        }

        const saltRounds = 10;
        const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin_2024', saltRounds)

        const newUser = await User.create({
            username: process.env.ADMIN_USERNAME || 'admin',
            fullname: process.env.ADMIN_FULLNAME || 'System Administrator',
            birthdate: new Date('1990-01-01'),
            phone: process.env.ADMIN_PHONE || '2288304050',
            email: process.env.ADMIN_EMAIL || 'lalosgo@gmail.com',
            password: password,
            status: 'Active',
            employee: {
                role: 'Administrator',
                hiredDate: new Date() 
            }
        })

        console.log('Admin created')
    } catch (error) {
        console.error('Error creating admin user:', error)
    }
}

createAdmin()