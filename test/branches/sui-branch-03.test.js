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

    describe('Entradas inválidas', () => {
        it('Debería fallar al crear sucursal con horarios inválidos', async () => {
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

        it('Debería fallar al crear sucursal sin dirección completa', async () => {
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

        it('Debería fallar al actualizar con coordenadas inválidas', async () => {
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
                        coordinates: [-99.1277, 19.4285]
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
                            coordinates: [181, 91]
                        }
                    }
                })

            expect(res.statusCode).toEqual(400)
        })

        it('Debería fallar al buscar con parámetros de ubicación inválidos', async () => {
            const res = await request(app)
                .get('/api/v1/branches?location[latitude]=invalid&location[longitude]=invalid')

            expect(res.statusCode).toEqual(400)
        })

        it('Debería fallar al enviar ID de sucursal con formato inválido', async () => {
            const res = await request(app)
                .get('/api/v1/branches/invalid-id')

            expect(res.statusCode).toEqual(400)
        })

        it('Debería fallar al actualizar productos con cantidades negativas', async () => {
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

        it('Debería fallar al enviar datos con tipos incorrectos', async () => {
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