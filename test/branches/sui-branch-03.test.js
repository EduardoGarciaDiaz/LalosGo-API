const request = require('supertest')
const app = require('../../src/index')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const Branch = require('../../src/models/Branch')
const User = require('../../src/models/User')

describe('Branch API Invalid Input Cases', () => {
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

    beforeAll(async () => {
        await Branch.deleteMany({})
        await User.deleteMany({})
        const userData = await createAdminUserData()
        adminUser = await User.create(userData)
    })

    afterAll(async () => {
        await Branch.deleteMany({})
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
        it('Fail to create branch with invalid hours', async () => {
            const res = await request(app)
                .post('/api/v1/branches/')
                .send({
                    name: 'Sucursal Test Horarios',
                    branchStatus: true,
                    openingTime: '25:00',
                    closingTime: '99:00',
                    address: {
                        street: 'Calle',
                        number: '123',
                        cologne: 'Colonia',
                        zipcode: 12345,
                        locality: 'Localidad',
                        municipality: 'Municipio',
                        federalEntity: 'Estado',
                        location: {
                            type: 'Point',
                            coordinates: [-99.1277, 19.4285]
                        }
                    }
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Fail to create branch with incomplete address', async () => {
            const res = await request(app)
                .post('/api/v1/branches/')
                .send({
                    name: 'Sucursal Test Dirección',
                    branchStatus: true,
                    openingTime: '08:00',
                    closingTime: '20:00',
                    address: {
                        street: 'Calle'
                    }
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Fail to update branch with invalid coordinates', async () => {
            const branch = await Branch.create({
                name: 'Sucursal Test Coordenadas',
                branchStatus: true,
                openingTime: '08:00',
                closingTime: '20:00',
                address: {
                    street: 'Calle',
                    number: '123',
                    cologne: 'Colonia',
                    zipcode: 12345,
                    locality: 'Localidad',
                    municipality: 'Municipio',
                    federalEntity: 'Estado',
                    location: {
                        type: 'Point',
                        coordinates: [19.4285, 80.1277]
                    }
                }
            })

            const res = await request(app)
                .put(`/api/v1/branches/${branch._id}`)
                .send({
                    address: {
                        ...branch.address,
                        location: {
                            type: 'Point',
                            coordinates: [5000, 5000]
                        }
                    }
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Fail to fetch branch with invalid location parameters', async () => {
            const res = await request(app)
                .get('/api/v1/branches?location[latitude]=invalid&location[longitude]=invalid')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Fail to fetch branch with invalid ID format', async () => {
            const res = await request(app)
                .get('/api/v1/branches/invalid-id')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Fail to update products with negative quantities', async () => {
            const branch = await Branch.create({
                name: 'Sucursal Test Productos',
                branchStatus: true,
                openingTime: '08:00',
                closingTime: '20:00',
                address: {
                    street: 'Calle',
                    number: '123',
                    cologne: 'Colonia',
                    zipcode: 12345,
                    locality: 'Localidad',
                    municipality: 'Municipio',
                    federalEntity: 'Estado',
                    location: {
                        type: 'Point',
                        coordinates: [-99.1277, 19.4285]
                    }
                }
            })

            const res = await request(app)
                .put(`/api/v1/branches/${branch._id}`)
                .send({
                    branchProducts: [
                        { productId: new mongoose.Types.ObjectId(), quantity: -5 }
                    ]
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Fail to create branch with incorrect data types', async () => {
            const res = await request(app)
                .post('/api/v1/branches/')
                .send({
                    name: 123,
                    branchStatus: "true",
                    openingTime: true,
                    closingTime: {},
                    address: 'dirección simple'
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })
    })
})