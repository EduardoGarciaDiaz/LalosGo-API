const request = require('supertest')
const app = require('../../src/index')
const mongoose = require('mongoose')
const User = require('../../src/models/User')

describe('User API Success Cases', () => {
    let authToken = ''

    let userClientTest = {
        _id: '',
        username: 'userTest',
        fullname: 'fullname',
        birthdate: new Date(),
        phone: 1234567890,
        email: 'email',
        password: 'SecureP@assw0rd',
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

    let paymentMethodTest = {
        _id: '',
        cardOwner: 'card Owner Test',
        cardNumber: '4415712345678910',
        cardEmitter: 'BBVA',
        expirationDate: '2025-12',
        cardType: 'Débito',
        paymentNetwork: 'MasterCard'
    }

    beforeAll(async () => {
        await User.deleteMany({})
    })

    afterAll(async () => {
        await User.deleteMany({})
        await mongoose.disconnect()
        app.close()
    })

    it('Create client account', async () => {
        const res = await request(app)
            .post('/api/v1/users')
            .send(userClientTest)
        expect(res.statusCode).toEqual(201)
        userClientTest._id = res.body.newClientAccount._id
    })

    it('Login user and get token', async () => {
        const loginRes = await request(app)
            .post('/api/v1/auth')
            .send({
                username: userClientTest.username,
                password: userClientTest.password
            });
        
        expect(loginRes.statusCode).toEqual(200);
        expect(loginRes.body.token).toBeDefined();
        authToken = loginRes.body.token;
    });

    describe('Payment Methods', () => {

        it('Add payment method', async () => {
            const res = await request(app)
                .post(`/api/v1/users/${userClientTest._id}/payment-methods`)
                .send(paymentMethodTest)
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(201)
            expect(res.body.newPaymentMethod.cardOwner).toEqual(paymentMethodTest.cardOwner)
            expect(res.body.newPaymentMethod.cardNumber).toEqual(paymentMethodTest.cardNumber)
            expect(res.body.newPaymentMethod.cardEmitter).toEqual(paymentMethodTest.cardEmitter)
            expect(res.body.newPaymentMethod.expirationDate).toEqual(paymentMethodTest.expirationDate)
            expect(res.body.newPaymentMethod.cardType).toEqual(paymentMethodTest.cardType)
            expect(res.body.newPaymentMethod.paymentNetwork).toEqual(paymentMethodTest.paymentNetwork)
    
            paymentMethodTest._id = res.body.newPaymentMethod._id;
        })
    
        it('Get payment methods', async () => {
            const res = await request(app)
                .get(`/api/v1/users/${userClientTest._id}/payment-methods`)
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(200)
            expect(res.body.userPaymentMethods).toHaveLength(1)
            expect(res.body.userPaymentMethods[0].cardOwner).toEqual(paymentMethodTest.cardOwner)
            expect(res.body.userPaymentMethods[0].cardNumber).toEqual(paymentMethodTest.cardNumber)
            expect(res.body.userPaymentMethods[0].cardEmitter).toEqual(paymentMethodTest.cardEmitter)
            expect(res.body.userPaymentMethods[0].expirationDate).toEqual(paymentMethodTest.expirationDate)
            expect(res.body.userPaymentMethods[0].cardType).toEqual(paymentMethodTest.cardType)
            expect(res.body.userPaymentMethods[0].paymentNetwork).toEqual(paymentMethodTest.paymentNetwork)
        })
    
        it('Delete payment method', async () => {
            const res = await request(app)
                .delete(`/api/v1/users/${userClientTest._id}/payment-methods/${paymentMethodTest._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                
            expect(res.statusCode).toEqual(200)
        })
    })
})