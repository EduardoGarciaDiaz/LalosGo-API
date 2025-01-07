const request = require('supertest')
const app = require('../../src/index')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const Category = require('../../src/models/Category')
const User = require('../../src/models/User')


describe('Cateogory API Failure Cases', () =>{
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

    let categoryTestSucces = {
        _id: '',
        identifier: 'LACT001',
        name: 'Lácteos y Carner',
        categoryStatus: true        
    }

    let categoryTestFailure = {
        _id: '',
        identifier: 'da',
        name: 223232,
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
    

    describe('Failure actions for category endpoints', () => {
        it('Get all inexistent categories', async () => {
            const res = await request(app)
                .get('/api/v1/categories')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toEqual("No hay categorías actualmente.")
        })

        it('Create category', async () => {
            const res = await request(app)
                .post('/api/v1/categories')
                .send({
                    identifier: categoryTestSucces.identifier,
                    name: categoryTestSucces.name,
                    categoryStatus: categoryTestSucces.categoryStatus
                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(201)
            expect(res.body.category.name).toEqual(categoryTestSucces.name)
            expect(res.body.message).toEqual('Categoría creada exitosamente.')
        })
    
       
        it('Create category fail', async () => {
            const res = await request(app)
                .post('/api/v1/categories')
                .send({
                    identifier: categoryTestFailure.identifier,
                    name: categoryTestFailure.name,
                    categoryStatus: categoryTestFailure.categoryStatus                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })

        it('Create category with repeated identifier', async () => {
            const res = await request(app)
                .post('/api/v1/categories')
                .send({
                    identifier: categoryTestSucces.identifier,
                    name: "new name",
                    categoryStatus: categoryTestSucces.categoryStatus
                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
            expect(res.body.message).toEqual('La categoría ya se encuentra registrada')
        })

        it('Create category with repeated name', async () => {
            const res = await request(app)
                .post('/api/v1/categories')
                .send({
                    identifier: "LACT002",
                    name: categoryTestSucces.name,
                    categoryStatus: categoryTestSucces.categoryStatus
                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
            expect(res.body.message).toEqual('La categoría ya se encuentra registrada')
        })

        it('Update inexistentent category', async () => {
            const updatedName = 'Categoria actualizada'
            const res = await request(app)
                .put(`/api/v1/categories/676b43d56d30b096111f9855`)
                .send({
                    identifier: categoryTestSucces.identifier,
                    name: updatedName,
                    categoryStatus: categoryTestSucces.categoryStatus
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toEqual('La categoría que quieres editar no existe')
        })

        it('Update status of inexistentent category', async () => {
            const updatedName = 'Categoria actualizada'
            const res = await request(app)
                .put(`/api/v1/categories/676b43d56d30b096111f9855?changeStatus=true`)
                .send({
                    identifier: categoryTestSucces.identifier,
                    name: updatedName,
                    categoryStatus: categoryTestSucces.categoryStatus
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toEqual('La categoría que quieres editar no existe')
        })
    
    })
})

