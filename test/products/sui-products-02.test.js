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

    describe('Fail actions for products Endpoint', () =>{
        
        it('Get empty Products', async () =>{
            const res = await request(app)
                .get(`/api/v1/products`)
                .send()
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toEqual("No se encontraron productos registrados")  
        })



        it('Create Product', async () => {
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
                    branches :[
                        {id:branchTest._id,
                        quantity: productTest.branches.quantity,}
                    ]
                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(201)
            expect(res.body.product._id).toBeDefined()
            productTest._id = res.body.product._id
            expect(res.body.message).toEqual("Producto creado exitosamente.")      

        })

        it('Create Product with repeated barCode', async () => {
            const res = await request(app)
                .post('/api/v1/products')
                .send({
                    barCode: productTest.barCode,
                    name: "OtherName",
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
            expect(res.body.message).toEqual("El producto ya se encuentra registrado.")      

        })

        it('Create Product with repeated name', async () => {
            const res = await request(app)
                .post('/api/v1/products')
                .send({
                    barCode: '131232131233',
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
            expect(res.body.message).toEqual("El producto ya se encuentra registrado.")      

        })

        it('Create Product with inexistent category', async () => {
            const res = await request(app)
                .post('/api/v1/products')
                .send({
                    barCode: "131232131233",
                    name: "newName",
                    description: productTest.description,
                    unitPrice: productTest.unitPrice,
                    expireDate: productTest.expireDate,
                    weight: productTest.weight,
                    limit: productTest.limit,
                    productStatus: productTest.productStatus,
                    unitMeasure: productTest.unitMeasure,
                    category: '676b444b6d30b096111f9865',
                    branches :[
                        {id:branchTest._id,
                        quantity: productTest.branches.quantity,}
                    ]
                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
            expect(res.body.message).toEqual("La categoria seleccionada para este producto, no existe.")      

        })

        it('Create Product with inexistent branch', async () => {
            const res = await request(app)
                .post('/api/v1/products')
                .send({
                    barCode: "131232131233",
                    name: "newName",
                    description: productTest.description,
                    unitPrice: productTest.unitPrice,
                    expireDate: productTest.expireDate,
                    weight: productTest.weight,
                    limit: productTest.limit,
                    productStatus: productTest.productStatus,
                    unitMeasure: productTest.unitMeasure,
                    category: categoryTest._id,
                    branches :[
                        {id: "676b444b6d30b096111f9865",
                        quantity: productTest.branches.quantity,}
                    ]
                    
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
            expect(res.body.message).toEqual("Hay una sucursal que no existe, revise las sucursales disponibles.")      

        })
        
        it('Edit inexistent Product', async () => {
            const fakeId = new mongoose.Types.ObjectId()
            const res = await request(app)
                .put(`/api/v1/products/${fakeId}`)
                .send({                    
                    barCode: "131232131203",
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
            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toEqual("El producto no se encuentra registrado.")      
        })

        it('Edit product with inexistent category', async () => {
            let newName = "Nuevo nombre del producto de pruebas"
            const res = await request(app)
                .put(`/api/v1/products/${productTest._id}`)
                .send({                    
                    barCode: productTest.barCode,
                    name: newName,
                    description: productTest.description,
                    unitPrice: productTest.unitPrice,
                    expireDate: productTest.expireDate,
                    weight: productTest.weight,
                    limit: productTest.limit,
                    productStatus: productTest.productStatus,
                    unitMeasure: productTest.unitMeasure,
                    category: "676b444b6d30b096111f9865",
                    branches :[
                        {id:branchTest._id,
                        quantity: productTest.branches.quantity,}
                    ]
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toEqual("La categoria seleccionada para este producto, no existe.")      
        })

        it('Edit product with inexistent branch', async () => {
            let newName = "Nuevo nombre del producto de pruebas"
            const res = await request(app)
                .put(`/api/v1/products/${productTest._id}`)
                .send({                    
                    barCode: productTest.barCode,
                    name: newName,
                    description: productTest.description,
                    unitPrice: productTest.unitPrice,
                    expireDate: productTest.expireDate,
                    weight: productTest.weight,
                    limit: productTest.limit,
                    productStatus: productTest.productStatus,
                    unitMeasure: productTest.unitMeasure,
                    category: categoryTest._id,
                    branches :[
                        {id:"676b444b6d30b096111f9865",
                        quantity: productTest.branches.quantity,}
                    ]
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
            expect(res.body.message).toEqual("Hay una sucursal que no existe, revise las sucursales disponibles.")      
        })

        it('Get Products by inexistent branch', async () =>{
            const res = await request(app)
                .get(`/api/v1/products/676b444b6d30b096111f9865`)
                .send()
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toEqual("No se encontraron sucursales registradas")  
        })

        it('Get Products by inexistent branch and category', async () =>{
            const res = await request(app)
                .get(`/api/v1/products/676b444b6d30b096111f9865/${categoryTest._id}`)
                .send()
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toEqual("No se encontraron productos")  
        })

        it('Get Products by branch and inexistent category', async () =>{
            const res = await request(app)
                .get(`/api/v1/products/${branchTest._id}/676b444b6d30b096111f9865`)
                .send()
                .set('Authorization', `Bearer ${authToken}`)
                console.log(res.body.branch)
            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toEqual("La categoria seleccionada para este producto, no existe.")  
        })

        
        it('Edit inexistent Product status', async () => {
            const res = await request(app)
                .patch(`/api/v1/products/676b444b6d30b096111f9865`)
                .send({                    
                   newStatus: true
                })
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(404)
            expect(res.body.message).toEqual("El producto no se encuentra registrado.")      
        })


    })

})