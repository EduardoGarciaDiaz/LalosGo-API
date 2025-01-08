const request = require('supertest')
const app = require('../../src/index')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const Branch = require('../../src/models/Branch')
const User = require('../../src/models/User')
const Category = require('../../src/models/Category');
const Product = require('../../src/models/Product');

describe('Products API Fail methods', () => {
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

    let categoryTest = {
        _id: '',
        identifier: 'LACT001',
        name: 'Lácteos y Carner',
        categoryStatus: true        
    } 

    let productTest = {
        _id: '',
        barCode: "234572345981",
        name:"Jabon de prueba",
        description:"Jabon de manos de pruebas unitarias",
        unitPrice:10.5,
        expireDate:"2025-05-10",
        weight:0.500,
        limit:100,
        productStatus:true,
        unitMeasure:"Kilogram",
        category: '',
        branches :{
            id:'',
            quantity: 10
        }
    }


    beforeAll(async () => {
        await Category.deleteMany({})
        await Branch.deleteMany({})
        await User.deleteMany({})
        await Product.deleteMany({})
        const userData = await createAdminUserData()
        adminUser = await User.create(userData)
    })

    afterAll(async () => {
        await Category.deleteMany({})
        await User.deleteMany({})
        await Branch.deleteMany({})
        await Product.deleteMany({})
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

    it('Create category', async () => {
        const res = await request(app)
            .post('/api/v1/categories')
            .send({
                identifier: categoryTest.identifier,
                name: categoryTest.name,
                categoryStatus: categoryTest.categoryStatus
                
            })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toEqual(201)
        expect(res.body.category.name).toEqual(categoryTest.name)
        categoryTest._id = res.body.category._id
        expect(res.body.message).toEqual('Categoría creada exitosamente.')
    })

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

    describe('Fail fields actions for product Endpoints', () => {

        it('Create Product without autorization', async () => {
            const res = await request(app)
                .post('/api/v1/products')
                .send({
                    barCode: productTest.barCode,
                    name: productTest.name,
                    description: productTest.description,
                    unitMeasure: productTest.unitMeasure,
                    category: categoryTest._id,
                    branches :[
                        {id:branchTest._id,
                        quantity: productTest.branches.quantity,}
                    ]
                    
                })
            expect(res.statusCode).toEqual(401)
        })

        it('Create Product without nessesary fields', async () => {
            const res = await request(app)
                .post('/api/v1/products')
                .send({
                    barCode: productTest.barCode,
                    name: productTest.name,
                    description: productTest.description,
                    unitMeasure: productTest.unitMeasure,
                    category: categoryTest._id,
                    branches :[
                        {id:branchTest._id,
                        quantity: productTest.branches.quantity,}
                    ]
                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })

        it('Create Product with empty filed', async () => {
            const res = await request(app)
                .post('/api/v1/products')
                .send({
                    barCode: "",
                    name: "",
                    description: productTest.description,
                    unitPrice: productTest.unitPrice,
                    expireDate: productTest.expireDate,
                    weight: productTest.weight,
                    limit: productTest.limit,
                    productStatus: productTest.productStatus,
                    unitMeasure: productTest.unitMeasure,
                    category: categoryTest._id,
                    branches :[
                        {id:branchTest._id,
                        quantity: productTest.branches.quantity,}
                    ]
                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })

        it('Create Product with invalid barcode', async () => {
            const res = await request(app)
                .post('/api/v1/products')
                .send({
                    barCode: "adasdasdadsadsadsadsadsa=)()=?dsa",
                    name: productTest.name,
                    description: productTest.description,
                    unitPrice: productTest.unitPrice,
                    expireDate: productTest.expireDate,
                    weight: productTest.weight,
                    limit: productTest.limit,
                    productStatus: productTest.productStatus,
                    unitMeasure: productTest.unitMeasure,
                    category: categoryTest._id,
                    branches :[
                        {id:branchTest._id,
                        quantity: productTest.branches.quantity,}
                    ]
                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })

        it('Create Product with invalid numbers', async () => {
            const res = await request(app)
                .post('/api/v1/products')
                .send({
                    barCode: productTest.barCode,
                    name: productTest.name,
                    description: productTest.description,
                    unitPrice: 11111111111111111,
                    expireDate: productTest.expireDate,
                    weight:1111111111111111,
                    limit: 1111111111111111111111,
                    productStatus: productTest.productStatus,
                    unitMeasure: productTest.unitMeasure,
                    category: categoryTest._id,
                    branches :[
                        {id:branchTest._id,
                        quantity: productTest.branches.quantity,}
                    ]
                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })

        it('Create Product without branch', async () => {
            const res = await request(app)
                .post('/api/v1/products')
                .send({
                    barCode: productTest.barCode,
                    name: productTest.name,
                    description: productTest.description,
                    unitPrice: productTest.unitPrice,
                    expireDate: productTest.expireDate,
                    weight: productTest.weight,
                    limit: productTest.limit,
                    productStatus: productTest.productStatus,
                    unitMeasure: productTest.unitMeasure,
                    category: categoryTest._id,
                    branches : [{
                            id: new mongoose.Types.ObjectId(),
                        quantity: 0
                    }]                   
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })

        it('Edit product without necesary fields', async () => {
            const fakeId = new mongoose.Types.ObjectId()
            const res = await request(app)
                .put(`/api/v1/products/${fakeId}`)
                .send({                    
                    barCode: "131232131203",
                    name: productTest.name,
                    unitMeasure: productTest.unitMeasure,
                    category: categoryTest._id,
                    branches :[
                        {id:branchTest._id,
                        quantity: productTest.branches.quantity,}
                    ]
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)     
        })

        it('Edit product with empty fields', async () => {
            const fakeId = new mongoose.Types.ObjectId()
            const res = await request(app)
                .put(`/api/v1/products/${fakeId}`)
                .send({                    
                    barCode: "",
                    name: "",
                    description: productTest.description,
                    unitPrice: productTest.unitPrice,
                    expireDate: productTest.expireDate,
                    weight: productTest.weight,
                    limit: productTest.limit,
                    productStatus: productTest.productStatus,
                    unitMeasure: productTest.unitMeasure,
                    category: categoryTest._id,
                    branches :[
                        {id:branchTest._id,
                        quantity: productTest.branches.quantity,}
                    ]
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)     
        })

        it('Edit product withinvalid barCode', async () => {
            const fakeId = new mongoose.Types.ObjectId()
            const res = await request(app)
                .put(`/api/v1/products/${fakeId}`)
                .send({                    
                    barCode: "13123213dsdsdfdfff#%&/(1203",
                    name: productTest.name,
                    description: productTest.description,
                    unitPrice: productTest.unitPrice,
                    expireDate: productTest.expireDate,
                    weight: productTest.weight,
                    limit: productTest.limit,
                    productStatus: productTest.productStatus,
                    unitMeasure: productTest.unitMeasure,
                    category: categoryTest._id,
                    branches :[
                        {id:branchTest._id,
                        quantity: productTest.branches.quantity,}
                    ]
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)     
        })

        it('Edit product withinvalid numbers', async () => {
            const fakeId = new mongoose.Types.ObjectId()
            const res = await request(app)
                .put(`/api/v1/products/${fakeId}`)
                .send({                    
                    barCode: productTest.barCode,
                    name: productTest.name,
                    description: productTest.description,
                    unitPrice: 0,
                    expireDate: productTest.expireDate,
                    weight: 11111111111111111111111,
                    limit: 111111111111111111111,
                    productStatus: productTest.productStatus,
                    unitMeasure: productTest.unitMeasure,
                    category: categoryTest._id,
                    branches :[
                        {id:branchTest._id,
                        quantity: productTest.branches.quantity,}
                    ]
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)     
        })


        it('Get Products with invalid  branch', async () =>{
            const res = await request(app)
                .get(`/api/v1/products/676b444b6d`)
                .send()
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })

        it('Get Products with invalid  category', async () =>{
            const res = await request(app)
                .get(`/api/v1/products/676b444b6d30b096111f9865/029vsdf`)
                .send()
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400) 
        })

    })




})