const request = require('supertest')
const app = require('../../src/index')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const Category = require('../../src/models/Category')
const User = require('../../src/models/User')

describe('Category API Success Cases', () => {
    let authToken = ''
    let adminUser = null

    const TEST_PASSWORD = 'AdminTest_001'
    const SALT_ROUNDS = 10;


    const createAdminUserData = async () => ({
        username: 'adminUnitTests',
        fullname: 'User Admin Unit Tests',
        birthdate: new Date('1990-01-01'),
        phone: '2288445511',
        email: 'admintest01@gmail.com',
        password: await bcrypt.hash(TEST_PASSWORD, SALT_ROUNDS),
        status: 'Active',
        employee: {
            role: 'Administrator',
            hiredDate: new Date()
        }
    })

    let categoryTest = {
        _id: '',
        identifier: 'LACT001',
        name: 'Lácteos y Carner',
        categoryStatus: true        
    }

    beforeAll(async () => {
        await Category.deleteMany({})
        await User.deleteMany({})
        const userData = await createAdminUserData()
        adminUser = await User.create(userData)
    })

    afterAll(async () => {
        await Category.deleteMany({})
        await User.deleteMany({})
        await mongoose.disconnect()
        app.close()
    })

    it('Authentication', async () => {
        const loginRes = await request(app)
            .post('/api/v1/auth')
            .send({
                username: adminUser.username,
                password: TEST_PASSWORD
            });

        expect(loginRes.statusCode).toEqual(200);
        expect(loginRes.body.token).toBeDefined();
        expect(loginRes.body).toHaveProperty('token')
        expect(typeof loginRes.body.token).toBe('string')
        expect(loginRes.body.token).not.toBe('')

        authToken = loginRes.body.token;
    })

    describe('Invalid Input Cases', () => {
        
        it('Create category with invalid Identifier', async () => {
            const res = await request(app)
                .post('/api/v1/categories')
                .send({
                    identifier: "d0s0d))))?=?(",
                    name: categoryTest.name,
                    categoryStatus: categoryTest.categoryStatus
                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })

        it('Create category with empty Identifier', async () => {
            const res = await request(app)
                .post('/api/v1/categories')
                .send({
                    identifier: "",
                    name: categoryTest.name,
                    categoryStatus: categoryTest.categoryStatus
                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })


        it('Create category with invalid name', async () => {
            const res = await request(app)
                .post('/api/v1/categories')
                .send({
                    identifier: categoryTest.identifier,
                    name: 101010,
                    categoryStatus: categoryTest.categoryStatus
                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })

        it('Create category with emmty name', async () => {
            const res = await request(app)
                .post('/api/v1/categories')
                .send({
                    identifier: categoryTest.identifier,
                    name: "",
                    categoryStatus: categoryTest.categoryStatus
                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })

        it('Create category null parameters', async () => {
            const res = await request(app)
                .post('/api/v1/categories')
                .send({
                    categoryStatus: categoryTest.categoryStatus                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })

    })

})