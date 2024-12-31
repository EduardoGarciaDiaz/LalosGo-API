const request = require('supertest')
const app = require('../../src/index')
const mongoose = require('mongoose')
const Order = require('../../src/models/Order')
const Branch = require('../../src/models/Branch')
const User = require('../../src/models/User')
const Product = require('../../src/models/Product')

describe('Cart API Failure Cases', () => {
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
        }
    }

    let productTest = {
        barCode: '123456789124',
        name: 'Producto 1',
        description: 'Descripcion del producto 1',
        unitPrice: 100,
        weight: 100,
        limit: 10,
        productStatus: true,
        unitMeasure: 'Piece',
        category: new mongoose.Types.ObjectId(),
        branch: ''
    }

    let userTest = {
        _id: '',
        username: 'username',
        fullname: 'fullname',
        birthdate: new Date(),
        phone: 1234567890,
        email: 'email',
        password: 'password',
        status: 'Active',
        client: {
            addresses: [{
                street: 'street',
                number: 123,
                cologne: 'cologne',
                zipcode: 12345,
                locality: 'locality',
                federalEntity: 'federalEntity',
                internalNumber: 1,
                type: 'Point',
                latitude: 19.4326,
                longitude: -99.1332,
                isCurrentAddress: true
            }],
            paymentMethods: []
        }
    }

    let orderId = '';

    beforeAll(async () => {
        await Branch.deleteMany({})
        await User.deleteMany({})
        await Product.deleteMany({})
    })

    afterAll(async () => {
        await Branch.deleteMany({})
        await User.deleteMany({})
        await Product.deleteMany({})
        await Order.deleteMany({})
        await mongoose.disconnect()
        app.close()
    })


    it('Crear una sucursal', async () => {
        const res = await request(app)
            .post('/api/v1/branches')
            .send(branchTest)

        expect(res.statusCode).toEqual(201);
        branchTest._id = res.body.branch._id
    })

    it('Create product', async () => {
        let branches = [{
            id: branchTest._id,
            quantity: 10
        }]
        const res = await request(app)
            .post('/api/v1/products')
            .send({
                ...productTest,
                branches
            })

        expect(res.statusCode).toEqual(201)
        productTest._id = res.body.product._id
        productTest.branch = branchTest._id
    })

    it('Create user', async () => {
        const res = await request(app)
            .post('/api/v1/users')
            .send(userTest)
        expect(res.statusCode).toEqual(201)
        userTest._id = res.body.newClientAccount._id
    })

    it('Create cart', async () => {
        let productForCartTest = {
            _id: productTest._id,
            quantity: 1,
            price: 100
        }
        const res = await request(app)
            .post(`/api/v1/carts/`)
            .send({
                userId: userTest._id,
                productForCart: productForCartTest,
                branchId: branchTest._id,
            })

        expect(res.statusCode).toEqual(200)
        orderId = res.body.cart._id
    })

    it('Attempt to create cart with missing data', async () => {
        const res = await request(app)
            .post(`/api/v1/carts/`)
            .send({
                userId: userTest._id,
            })

        expect(res.statusCode).toEqual(400)
    })

    it('Create cart with incorrect data', async () => {
        let productForCartTest = {
            _id: productTest._id,
            quantity: -50,
            price: 100
        }
        const res = await request(app)
            .post(`/api/v1/carts/`)
            .send({
                userId: userTest._id,
                productForCart: productForCartTest,
                branchId: branchTest._id,
            })

        expect(res.statusCode).toEqual(400)
    })

    it('Get cart with invalid user ID', async () => {
        const res = await request(app)
            .get(`/api/v1/carts/${'1'}`)
            .query({
                status: 'reserved'
            })

        expect(res.statusCode).toEqual(400)
    })

    it('Get cart with invalid cart status', async () => {
        const res = await request(app)
            .get(`/api/v1/carts/${'1'}`)
            .query({
                status: 'carrito'
            })

        expect(res.statusCode).toEqual(400)
    })

    it('Get cart details without user id', async () => {
        let userId = null;
        const res = await request(app)
            .get(`/api/v1/carts/${userId}/total`)
            .query({
                status: 'reserved'
            })

        expect(res.statusCode).toEqual(400)
    })

    it('Get cart details with status other than cart', async () => {
        let userId = null;
        const res = await request(app)
            .get(`/api/v1/carts/${userId}/total`)
            .query({
                status: 'cancelado'
            })

        expect(res.statusCode).toEqual(400)
    })



    it('Delete cart with invalid id', async () => {
        const res = await request(app)
            .delete(`/api/v1/carts/idDelUsuario01`)
            .query({
                status: 'reserved'
            })

        expect(res.statusCode).toEqual(400)
    })

    it('Delete cart with a status other than cart', async () => {
        const res = await request(app)
            .delete(`/api/v1/carts/idDelUsuario01`)
            .query({
                status: 'vendido'
            })

        expect(res.statusCode).toEqual(400)
    })

    it('Update cart quantities with missing data', async () => {
        const res = await request(app)
            .patch(`/api/v1/carts/${orderId}`)
            .query({
                status: 'reserved'
            })

        expect(res.statusCode).toEqual(400)
    })

    it('Update cart quantities with incorrect data', async () => {
        const res = await request(app)
            .patch(`/api/v1/carts/${orderId}`)
            .query({
                status: 'reserved'
            })
            .send({
                productId: productTest._id,
                quantity: -50,
                branchId: branchTest._id
            })

        expect(res.statusCode).toEqual(400)
    })

})