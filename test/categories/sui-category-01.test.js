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

    describe('Success action for Category endpoints', () => {
        
        it('Create category', async () => {
            const res = await request(app)
                .post('/api/v1/categories')
                .send({
                    identifier: categoryTest.identifier,
                    name: categoryTest.name,
                    categoryStatus: categoryTest.categoryStatus
                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(201)
            expect(res.body.category.name).toEqual(categoryTest.name)
            categoryTest._id = res.body.category._id
            expect(res.body.message).toEqual('Categoría creada exitosamente.')
        })

        it('Update Category data', async () => {
            const updatedName = 'Categoria actualizada'
            const res = await request(app)
                .put(`/api/v1/categories/${categoryTest._id}`)
                .send({
                    identifier: categoryTest.identifier,
                    name: updatedName,
                    categoryStatus: categoryTest.categoryStatus
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(200)
            expect(res.body.category.name).toEqual(updatedName)
            expect(res.body.message).toEqual('La categoría se ha actualizado exitosamente')
        })

        it('Update Category status to inactive', async () => {
            const updatedName = 'Categoria actualizada'
            const res = await request(app)
                .put(`/api/v1/categories/${categoryTest._id}?changeStatus=false`)
                .send({
                    identifier: categoryTest.identifier,
                    name: updatedName,
                    categoryStatus: categoryTest.categoryStatus
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(200)
            expect(res.body.category.name).toEqual(updatedName)
            expect(res.body.message).toEqual('La categoría se ha desactivado correctamente.')
        })

        it('Update Category status to active', async () => {
            const updatedName = 'Categoria actualizada'
            const res = await request(app)
                .put(`/api/v1/categories/${categoryTest._id}?changeStatus=true`)
                .send({
                    identifier: categoryTest.identifier,
                    name: updatedName,
                    categoryStatus: categoryTest.categoryStatus
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(200)
            expect(res.body.category.categoryStatus).toEqual(true)
            expect(res.body.message).toEqual('La categoría se ha activado correctamente.')
        })

        it('Get all categories', async () => {
            const res = await request(app)
                .get('/api/v1/categories')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(200)
            expect(res.body.category.length).toBeGreaterThan(0)
        })

    })
})