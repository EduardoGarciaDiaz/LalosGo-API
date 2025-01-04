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
        birthdate: new Date('2003-10-09T00:00:00.000Z'),
        phone: 1234567890,
        email: 'email@hotmail.com',
        password: 'P@ssw0rd',
        status: 'Active',
        client: {
            addresses: [{
                street: 'street',
                number: 123,
                cologne: 'cologne',
                zipcode: 12345,
                locality: 'locality',
                federalEntity: 'federalEntity',
                internalNumber: 12,
                type: 'Point',
                latitude: 19.4326,
                longitude: -99.1332,
                isCurrentAddress: true
            }],
            paymentMethods: []
        }
    }

    let addressMethodTest = {
        street: 'Avenida Xalapa',
        number: 159,
        cologne: 'Veracruz',
        zipcode: 91020,
        locality: 'Xalapa-Enríquez',
        federalEntity: 'México',
        internalNumber: 951,
        type: 'Point',
        latitude: 19.541186809084778,
        longitude: -96.92744610055618,
        isCurrentAddress: false
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

    describe('Address methods', () => {
        it('Add address method', async () => {
            const res = await request(app)
                .post(`/api/v1/users/${userClientTest._id}/addresses`)
                .send(addressMethodTest)
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(201)
            expect(res.body.newAddress.street).toEqual(addressMethodTest.street)
            expect(res.body.newAddress.number.toString()).toEqual(addressMethodTest.number.toString())
            expect(res.body.newAddress.cologne).toEqual(addressMethodTest.cologne)
            expect(res.body.newAddress.zipcode.toString()).toEqual(addressMethodTest.zipcode.toString())
            expect(res.body.newAddress.locality).toEqual(addressMethodTest.locality)
            expect(res.body.newAddress.federalEntity).toEqual(addressMethodTest.federalEntity)
            expect(res.body.newAddress.internalNumber.toString()).toEqual(addressMethodTest.internalNumber.toString())
            expect(res.body.newAddress.type).toEqual(addressMethodTest.type)
            expect(res.body.newAddress.latitude).toEqual(addressMethodTest.latitude)
            expect(res.body.newAddress.longitude).toEqual(addressMethodTest.longitude)
            expect(res.body.newAddress.isCurrentAddress).toEqual(addressMethodTest.isCurrentAddress)
    
            addressMethodTest._id = res.body.newAddress._id;
        })

        it('Get addresses', async () => {
            const res = await request(app)
                .get(`/api/v1/users/${userClientTest._id}/addresses`)
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(200)
            expect(res.body.addresses).toHaveLength(2)
            expect(res.body.addresses[1].street).toEqual(addressMethodTest.street)
            expect(res.body.addresses[1].number.toString()).toEqual(addressMethodTest.number.toString())
            expect(res.body.addresses[1].cologne).toEqual(addressMethodTest.cologne)
            expect(res.body.addresses[1].zipcode.toString()).toEqual(addressMethodTest.zipcode.toString())
            expect(res.body.addresses[1].locality).toEqual(addressMethodTest.locality)
            expect(res.body.addresses[1].federalEntity).toEqual(addressMethodTest.federalEntity)
            expect(res.body.addresses[1].internalNumber.toString()).toEqual(addressMethodTest.internalNumber.toString())
            expect(res.body.addresses[1].type).toEqual(addressMethodTest.type)
            expect(res.body.addresses[1].latitude).toEqual(addressMethodTest.latitude)
            expect(res.body.addresses[1].longitude).toEqual(addressMethodTest.longitude)
            expect(res.body.addresses[1].isCurrentAddress).toEqual(addressMethodTest.isCurrentAddress)
        })

        it('Modify address method', async () => {
            let addressModifyMethodTest = {
                street: 'Perote',
                number: 4321,
                cologne: 'Veracruz',
                zipcode: 91018,
                locality: 'Xalapa-Enríquez',
                federalEntity: 'México',
                internalNumber: 5321,
                latitude: 19.541186809084778,
                longitude: -96.92744610055618
            }

            const res = await request(app)
            .put(`/api/v1/users/${userClientTest._id}/addresses/${addressMethodTest._id}`)
            .send(addressModifyMethodTest)
            .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(201)

            expect(res.body.newAddress.street).toEqual(addressModifyMethodTest.street)
            expect(res.body.newAddress.number.toString()).toEqual(addressModifyMethodTest.number.toString())
            expect(res.body.newAddress.cologne).toEqual(addressModifyMethodTest.cologne)
            expect(res.body.newAddress.zipcode.toString()).toEqual(addressModifyMethodTest.zipcode.toString())
            expect(res.body.newAddress.locality).toEqual(addressModifyMethodTest.locality)
            expect(res.body.newAddress.federalEntity).toEqual(addressModifyMethodTest.federalEntity)
            expect(res.body.newAddress.internalNumber.toString()).toEqual(addressModifyMethodTest.internalNumber.toString())
            expect(res.body.newAddress.latitude).toEqual(addressModifyMethodTest.latitude)
            expect(res.body.newAddress.longitude).toEqual(addressModifyMethodTest.longitude)
        })

        it('Delete address method', async () => {
            const res = await request(app)
            .delete(`/api/v1/users/${userClientTest._id}/addresses/${addressMethodTest._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            console.log('Response body:', res.body);
            console.log('Response status:', res.statusCode);
            expect(res.statusCode).toEqual(200)
        })
    })

    describe('customer methods', () => {
        it('Modify customer account method', async () => {
            let userClientModifyTest = {
                username: 'userModifyTest',
                fullname: 'fullnameModifyTest',
                birthdate: new Date('2003-10-09T00:00:00.000Z'),
                phone: 1234567890,
                email: 'email@hotmail.com',
            }

            const res = await request(app)
                .put(`/api/v1/users/${userClientTest._id}`)
                .send(userClientModifyTest)
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(200)

            expect(res.body.updateClientAccount.username).toEqual(userClientModifyTest.username)
            expect(res.body.updateClientAccount.fullname).toEqual(userClientModifyTest.fullname)
            expect(res.body.updateClientAccount.email).toEqual(userClientModifyTest.email)
    
            userClientTest._id = res.body.updateClientAccount._id;
        }) 

        it('Recover customer password method', async () => {
            let recoverPassword  = {
                newPassword: "P@ssw0rdNew",
                confirmPassword: "P@ssw0rdNew"
            }

                const res = await request(app)
                .patch(`/api/v1/users/${userClientTest._id}/password`)
                .send(recoverPassword)
                expect(res.statusCode).toEqual(200)
        })

    })
})