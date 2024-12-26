const request = require('supertest')
const app = require('../../src/index')
const mongoose = require('mongoose')
const Branch = require('../../src/models/Branch')

describe('Branch API Success Cases', () => {
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
    })

    afterAll(async () => {
        await Branch.deleteMany({})
        await mongoose.disconnect()
        app.close()
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

            expect(res.statusCode).toEqual(200)
            expect(res.body.branch.name).toEqual(updatedName)
            expect(res.body.branch.openingTime).toEqual('07:00')
        })

        it('Get all branches', async () => {
            const res = await request(app)
                .get('/api/v1/branches')

            expect(res.statusCode).toEqual(200)
            expect(Array.isArray(res.body.branches)).toBeTruthy()
            expect(res.body.branches.length).toBeGreaterThan(0)
        })

        it('Get specific branch', async () => {
            const res = await request(app)
                .get(`/api/v1/branches/${branchTest._id}`)

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

            expect(res.statusCode).toEqual(200)
            expect(res.body.branches).toBeDefined()
        })

        it('Change branch status', async () => {
            const res = await request(app)
                .patch(`/api/v1/branches/${branchTest._id}`)
                .query({ changeStatus: 'Active' })

            expect(res.statusCode).toEqual(200)
            expect(res.body.message).toEqual('Estado de sucursal actualizado.')
        })
    })
})