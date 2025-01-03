const request = require('supertest')
const app = require('../../src/index')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const Branch = require('../../src/models/Branch')
const User = require('../../src/models/User')

describe('Branch API Success Cases', () => {
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

    let branchTest = {
        _id: '',
        name: 'Sucursal Principal',
        openingTime: '08:00',
        closingTime: '20:00',
        address: {
            street: 'Av. Principal',
            number: '123',
            cologne: 'Centro',
            zipcode: 12345,
            locality: 'Ciudad',
            municipality: 'Municipio',
            federalEntity: 'Estado',
            internalNumber: '1',
            location: {
                type: 'Point',
                coordinates: [19.4326, -99.1332]
            }
        },
        branchProducts: []
    }

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

    describe('Success actions', () => {
        it('Create branch', async () => {
            const res = await request(app)
                .post('/api/v1/branches')
                .send({
                    name: branchTest.name,
                    openingTime: branchTest.openingTime,
                    closingTime: branchTest.closingTime,
                    address: {
                        ...branchTest.address,
                        number: parseInt(branchTest.address.number),
                        internalNumber: parseInt(branchTest.address.internalNumber)
                    },
                    branchStatus: branchTest.branchStatus
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(201)
            expect(res.body.branch.name).toEqual(branchTest.name)
            branchTest._id = res.body.branch._id
            expect(res.body.message).toEqual('Sucursal creada con éxito.')
        })

        it('Update branch data', async () => {
            const updatedName = 'Sucursal Principal Actualizada'
            const res = await request(app)
                .put(`/api/v1/branches/${branchTest._id}`)
                .send({
                    name: updatedName,
                    openingTime: '07:00',
                    closingTime: '22:00',
                    address: {
                        ...branchTest.address,
                        number: parseInt(branchTest.address.number),
                        internalNumber: parseInt(branchTest.address.internalNumber)
                    },
                    branchStatus: branchTest.branchStatus
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(200)
            expect(res.body.branch.name).toEqual(updatedName)
            expect(res.body.branch.openingTime).toEqual('07:00')
        })

        it('Get all branches', async () => {
            const res = await request(app)
                .get('/api/v1/branches')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(200)
            expect(Array.isArray(res.body.branches)).toBeTruthy()
            expect(res.body.branches.length).toBeGreaterThan(0)
        })

        it('Get specific branch', async () => {
            const res = await request(app)
                .get(`/api/v1/branches/${branchTest._id}`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(200)
            expect(res.body.branch._id).toEqual(branchTest._id)
            expect(res.body.message).toEqual('Sucursal recupera con éxito')
        })

        it('Get nearest branch', async () => {
            const res = await request(app)
                .get('/api/v1/branches')
                .query({
                    recoverProduct: false,
                    'location[latitude]': 19.4326,
                    'location[longitude]': -99.1332
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(200)
            expect(res.body.branches).toBeDefined()
        })

        it('Change branch status', async () => {
            const res = await request(app)
                .patch(`/api/v1/branches/${branchTest._id}`)
                .query({ changeStatus: 'Active' })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(200)
            expect(res.body.message).toEqual('Estado de sucursal actualizado.')
        })
    })
})