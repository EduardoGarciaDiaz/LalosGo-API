const request = require('supertest')
const app = require('../../src/index')
const mongoose = require('mongoose')
const Branch = require('../../src/models/Branch')

describe('Branch API Failure Cases', () => {
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
        const branch = new Branch(existingBranch)
        await branch.save()
        existingBranch._id = branch._id
    })

    afterAll(async () => {
        await Branch.deleteMany({})
        await mongoose.disconnect()
        app.close()
    })

    describe('Casos de fallo esperados', () => {
        it('Fallar al crear una sucursal con nombre duplicado', async () => {
            const res = await request(app)
                .post('/api/v1/branches/')
                .send({
                    ...existingBranch,
                    _id: new mongoose.Types.ObjectId(), 
                })

            expect(res.statusCode).toEqual(400)
            expect(res.body.message).toEqual('Ya existe una sucursal con ese nombre.')
        })

        it('Fallar al actualizar una sucursal inexistente', async () => {
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

            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toEqual('La sucursal que quieres editar no existe.')
        })

        it('Fallar al actualizar con un nombre que ya existe', async () => {
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

            expect(res.statusCode).toEqual(400)
            expect(res.body.message).toEqual('Ya existe una sucursal con ese nombre.')
        })

        it('Fallar al consultar una sucursal inexistente', async () => {
            const fakeId = new mongoose.Types.ObjectId()
            const res = await request(app)
                .get(`/api/v1/branches/${fakeId}`)

            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toContain('No se encontró la sucursal con el id')
        })

        it('Fallar al buscar sucursal cercana sin ubicaciones disponibles', async () => {
            await Branch.deleteMany({})
            const res = await request(app)
                .get('/api/v1/branches?location[latitude]=0&location[longitude]=0')

            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toContain('No se encontraron sucursales registradas')
        })

        it('Fallar al intentar cambiar estado de sucursal inexistente', async () => {
            const fakeId = new mongoose.Types.ObjectId()
            const res = await request(app)
                .patch(`/api/v1/branches/${fakeId}`)

            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toEqual('La sucursal que quieres actualizar no existe.')
        })
    })
})