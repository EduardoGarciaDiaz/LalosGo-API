const request = require('supertest')
const app = require('../../src/index')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const Branch = require('../../src/models/Branch')
const User = require('../../src/models/User')

describe('Branch API Failure Cases', () => {
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

    let existingBranch = {
        name: 'Sucursal Existente',
        openingTime: '08:00',
        closingTime: '20:00',
        address: {
            street: 'Calle Test',
            number: '123',
            cologne: 'Colonia',
            zipcode: '12345',
            locality: 'Localidad',
            municipality: 'Municipio',
            federalEntity: 'Estado',
            internalNumber: '1',
            location: {
                type: 'Point',
                coordinates: [19.4326, -99.1332]
            }
        },
        branchStatus: true,
        branchProducts: []
    }

    beforeAll(async () => {
        await Branch.deleteMany({})
        await User.deleteMany({})
        const branch = new Branch(existingBranch)
        await branch.save()
        existingBranch._id = branch._id
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

    describe('Expected Failure Cases', () => {
        it('Fail to create a branch with a duplicate name', async () => {
            const res = await request(app)
                .post('/api/v1/branches/')
                .send({
                    ...existingBranch,
                    _id: new mongoose.Types.ObjectId(),
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
            expect(res.body.message).toEqual('Ya existe una sucursal con ese nombre.')
        })

        it('Fail to update a non-existent branch', async () => {
            const fakeId = new mongoose.Types.ObjectId()
            const res = await request(app)
                .put(`/api/v1/branches/${fakeId}`)
                .send({
                    name: 'Nueva Sucursal',
                    openingTime: existingBranch.openingTime,
                    closingTime: existingBranch.closingTime,
                    address: existingBranch.address,
                    branchStatus: true
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toEqual('La sucursal que quieres editar no existe.')
        })

        it('Fail to update with an existing branch name', async () => {
            const newBranch = await Branch.create({
                name: 'Otra Sucursal',
                openingTime: '09:00',
                closingTime: '21:00',
                address: existingBranch.address,
                branchStatus: true
            })

            const res = await request(app)
                .put(`/api/v1/branches/${newBranch._id}`)
                .send({
                    name: existingBranch.name,
                    openingTime: '09:00',
                    closingTime: '21:00',
                    address: existingBranch.address,
                    branchStatus: true
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
            expect(res.body.message).toEqual('Ya existe una sucursal con ese nombre.')
        })

        it('Fail to retrieve a non-existent branch', async () => {
            const fakeId = new mongoose.Types.ObjectId()
            const res = await request(app)
                .get(`/api/v1/branches/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toContain('No se encontró la sucursal con el id')
        })

        it('Fail to find nearby branch without available locations', async () => {
            await Branch.deleteMany({})
            const res = await request(app)
                .get('/api/v1/branches?location[latitude]=0&location[longitude]=0')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Fail to update status of a non-existent branch', async () => {
            const fakeId = new mongoose.Types.ObjectId()
            const res = await request(app)
                .patch(`/api/v1/branches/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toEqual('La sucursal que quieres actualizar no existe.')
        })

        it('Fail to update branch without token', async () => {
            const res = await request(app)
                .patch(`/api/v1/branches/${existingBranch._id}`)
                .query({ changeStatus: 'Invalid' })

            expect(res.statusCode).toEqual(401)
        })
    })
})