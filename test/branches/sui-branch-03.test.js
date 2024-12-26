const request = require('supertest')
const app = require('../../src/index')
const mongoose = require('mongoose')
const Branch = require('../../src/models/Branch')

describe('Branch API Invalid Input Cases', () => {
    beforeAll(async () => {
        await Branch.deleteMany({})
    })

    afterAll(async () => {
        await Branch.deleteMany({})
        await mongoose.disconnect()
        app.close()
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

            expect(res.statusCode).toEqual(400)
        })

        it('Fail to fetch branch with invalid location parameters', async () => {
            const res = await request(app)
                .get('/api/v1/branches?location[latitude]=invalid&location[longitude]=invalid')

            expect(res.statusCode).toEqual(400)
        })

        it('Fail to fetch branch with invalid ID format', async () => {
            const res = await request(app)
                .get('/api/v1/branches/invalid-id')

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

            expect(res.statusCode).toEqual(400)
        })
    })
})