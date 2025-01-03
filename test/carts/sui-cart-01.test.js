const request = require('supertest')
const app = require('../../src/index')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const Order = require('../../src/models/Order')
const Branch = require('../../src/models/Branch')
const User = require('../../src/models/User')
const Product = require('../../src/models/Product')

describe('Cart API Success Cases', () => {
    let authToken = ''
    const TEST_PASSWORD = 'UserPass00_1'

    let authTokenAdmin = ''
    let adminUser = null
    const TEST_PASSWORD_ADMIN = 'AdminTest_001'
    const SALT_ROUNDS = 10;

    const createAdminUserData = async () => ({
        username: 'adminUnitTests',
        fullname: 'User Admin Unit Tests',
        birthdate: new Date('1990-01-01'),
        phone: '2288445511',
        email: 'admintest01@gmail.com',
        password: await bcrypt.hash(TEST_PASSWORD_ADMIN, SALT_ROUNDS),
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
        password: TEST_PASSWORD,
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
        await Order.deleteMany({})
        const userData = await createAdminUserData()
        adminUser = await User.create(userData)
    })

    afterAll(async () => {
        await Branch.deleteMany({})
        await User.deleteMany({})
        await Product.deleteMany({})
        await Order.deleteMany({})
        await mongoose.disconnect()
        app.close()
    })

    it('Authentication Admin', async () => {
        const loginRes = await request(app)
            .post('/api/v1/auth')
            .send({
                username: adminUser.username,
                password: TEST_PASSWORD_ADMIN
            });

        expect(loginRes.statusCode).toEqual(200);
        expect(loginRes.body.token).toBeDefined();
        expect(loginRes.body).toHaveProperty('token')
        expect(typeof loginRes.body.token).toBe('string')
        expect(loginRes.body.token).not.toBe('')

        authTokenAdmin = loginRes.body.token;
    })


    it('Create branch', async () => {
        const res = await request(app)
            .post('/api/v1/branches')
            .send(branchTest)
            .set('Authorization', `Bearer ${authTokenAdmin}`)

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
            .set('Authorization', `Bearer ${authTokenAdmin}`)

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

    it('Authentication', async () => {
        const loginRes = await request(app)
            .post('/api/v1/auth')
            .send({
                username: userTest.username,
                password: TEST_PASSWORD
            });

        expect(loginRes.statusCode).toEqual(200);
        expect(loginRes.body.token).toBeDefined();
        expect(loginRes.body).toHaveProperty('token')
        expect(typeof loginRes.body.token).toBe('string')
        expect(loginRes.body.token).not.toBe('')

        authToken = loginRes.body.token;
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
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toEqual(200)
        expect(res.body.cart).toBeDefined()
        orderId = res.body.cart._id
    })

    it('Get cart', async () => {
        const res = await request(app)
            .get(`/api/v1/carts/${userTest._id}`)
            .query({
                status: 'reserved'
            })
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toEqual(200)
        expect(res.body.cart).toBeDefined()
    })

    it('Get cart details', async () => {
        const res = await request(app)
            .get(`/api/v1/carts/${userTest._id}/total`)
            .query({
                status: 'reserved'
            })
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toEqual(200)
        expect(res.body.cartSummary).toBeDefined()
        expect(res.body.cartSummary.totalPrice).toEqual(150)
    })

    it('Delete cart', async () => {
        const res = await request(app)
            .delete(`/api/v1/carts/${userTest._id}`)
            .query({
                status: 'reserved'
            })
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toEqual(200)
    })

    it('Update cart quantities', async () => {
        const res = await request(app)
            .patch(`/api/v1/carts/${orderId}`)
            .query({
                status: 'reserved'
            })
            .send({
                productId: productTest._id,
                quantity: 2,
                branchId: branchTest._id
            })
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toEqual(200)
        expect(res.body.cart).toBeDefined()
    })
})