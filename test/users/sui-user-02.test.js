const request = require('supertest')
const app = require('../../src/index')
const mongoose = require('mongoose')
const User = require('../../src/models/User')

describe('User API Failure Cases', () => {
    let authToken = ''

    let userClientTest = {
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
        it('Add payment method with invalid user Id', async () => {
            const res = await request(app)
                .post(`/api/v1/users/1234/payment-methods`)
                .send(paymentMethodTest)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Add payment method with null user Id', async () => {
            const res = await request(app)
                .post(`/api/v1/users/${null}/payment-methods`)
                .send(paymentMethodTest)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Add payment method without all fields', async () => {
            const res = await request(app)
                .post(`/api/v1/users/${null}/payment-methods`)
                .send({
                    cardNumber: '4415712345678910',
                    cardEmitter: 'BBVA'
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Add payment method with invalid card number', async () => {
            const res = await request(app)
            .post(`/api/v1/users/${null}/payment-methods`)
            .send({
                cardOwner: 'card Owner Test',
                cardNumber: 'one,two,three,four',
                cardEmitter: 'BBVA',
                expirationDate: '2025-12',
                cardType: 'Débito',
                paymentNetwork: 'MasterCard'
            })
            .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Add payment method with invalid card owner', async () => {
            const res = await request(app)
            .post(`/api/v1/users/${null}/payment-methods`)
            .send({
                cardOwner: '',
                cardNumber: '4415712345678910',
                cardEmitter: 'BBVA',
                expirationDate: '2025-12',
                cardType: 'Débito',
                paymentNetwork: 'MasterCard'
            })
            .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Add payment method with invalid card emitter', async () => {
            const res = await request(app)
            .post(`/api/v1/users/${null}/payment-methods`)
            .send({
                cardOwner: 'card Owner Test',
                cardNumber: '4415712345678910',
                cardEmitter: '',
                expirationDate: '2025-12',
                cardType: 'Débito',
                paymentNetwork: 'MasterCard'
            })
            .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Add payment method with invalid expiration date', async () => {
            const res = await request(app)
            .post(`/api/v1/users/${null}/payment-methods`)
            .send({
                cardOwner: 'card Owner Test',
                cardNumber: '4415712345678910',
                cardEmitter: 'BBVA',
                expirationDate: 'on december',
                cardType: 'Débito',
                paymentNetwork: 'MasterCard'
            })
            .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Add payment method with invalid card type', async () => {
            const res = await request(app)
            .post(`/api/v1/users/${null}/payment-methods`)
            .send({
                cardOwner: 'card Owner Test',
                cardNumber: '4415712345678910',
                cardEmitter: 'BBVA',
                expirationDate: '2025-12',
                cardType: 'Deb',
                paymentNetwork: 'MasterCard'
            })
            .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Add payment method with invalid payment network', async () => {
            const res = await request(app)
            .post(`/api/v1/users/${null}/payment-methods`)
            .send({
                cardOwner: 'card Owner Test',
                cardNumber: '4415712345678910',
                cardEmitter: 'BBVA',
                expirationDate: '2025-12',
                cardType: 'Débito',
                paymentNetwork: 'Aaamex'
            })
            .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })
    
        it('Get payment methods with invalid ID', async () => {
            const res = await request(app)
                .get(`/api/v1/users/12a4/payment-methods`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })
    
        it('Delete payment method with invalid ID', async () => {
            const res = await request(app)
                .delete(`/api/v1/users/${null}/payment-methods/${12222}`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(400)
        })

        it('Get payment methods without authorization', async () => {
            const res = await request(app)
                .get(`/api/v1/users/${userClientTest._id}/payment-methods`)
            expect(res.statusCode).toEqual(401)
        })
    })
})