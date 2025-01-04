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

    describe('Address methods', () => {
        it('Add address with invalid customer id method', async () => {
            const res = await request(app)
                .post(`/api/v1/users/123/addresses`)
                .send(addressMethodTest)
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)

        })

        it('Add address with null client id', async () => {
            const res = await request(app)
                .post(`/api/v1/users/${null}/addresses`)
                .send(addressMethodTest)
                .set('Authorization', `Bearer ${authToken}`)
                expect(res.statusCode).toEqual(400)
    
        })

        it('Add address with invalid fields', async () => {            
                let addressInvaldFieldsMethodTest = {
                    number: 159,
                    cologne: 'Veracruz',
                    zipcode: 91020,
                    locality: 'Xalapa-Enríquez',
                    type: 'Point',
                    latitude: 19.541186809084778,
                    longitude: -96.92744610055618,
                    isCurrentAddress: false
                }

            const res = await request(app)
                .post(`/api/v1/users/${userClientTest._id}/addresses`)
                .send(addressInvaldFieldsMethodTest)
                .set('Authorization', `Bearer ${authToken}`)
                expect(res.statusCode).toEqual(400)
    
        })

        it('Get addresses with userid invalid', async () => {
            const res = await request(app)
                .get(`/api/v1/users/123/addresses`)
                .set('Authorization', `Bearer ${authToken}`)
            
            expect(res.statusCode).toEqual(400)
        })

        it('Modify address method with null customer id', async () => {
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
            .put(`/api/v1/users/${null}/addresses/${addressMethodTest._id}`)
            .send(addressModifyMethodTest)
            .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })

        it('Modify address method with null address id', async () => {
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
            .put(`/api/v1/users/${userClientTest._id}/addresses/${null}`)
            .send(addressModifyMethodTest)
            .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })

        it('Modify address method with invalid fields', async () => {
            let addressModifyMethodTest = {
                street: 'Perote',
                number: 4321,
                zipcode: 91018,
                locality: 'Xalapa-Enríquez',
                latitude: 19.541186809084778,
                longitude: -96.92744610055618
            }

            const res = await request(app)
            .put(`/api/v1/users/${userClientTest._id}/addresses/${addressMethodTest._id}`)
            .send(addressModifyMethodTest)
            .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })


        it('Delete address method with null customer id', async () => {
            const res = await request(app)
            .delete(`/api/v1/users/${null}/addresses/${addressMethodTest._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            console.log('Response body:', res.body);
            console.log('Response status:', res.statusCode);
            expect(res.statusCode).toEqual(400)
        })

        
        it('Delete address method with null address id', async () => {
            const res = await request(app)
            .delete(`/api/v1/users/${userClientTest._id}/addresses/${null}`)
            .set('Authorization', `Bearer ${authToken}`)
            console.log('Response body:', res.body);
            console.log('Response status:', res.statusCode);
            expect(res.statusCode).toEqual(400)
        })

        it('Get addresses with invalid ID', async () => {
            const res = await request(app)
            .get(`/api/v1/users/123/addresses`)
            .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })

        it('Get addresses with null ID', async () => {
            const res = await request(app)
            .get(`/api/v1/users/${null}/addresses`)
            .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        })
    })

    describe('customer methods', () => {
        it('Create customer account with invalid fields', async () => {
            let userInvalidTest = {
                username: 'userInvalidTest'
            }
            
            const res = await request(app)
            .post('/api/v1/users')
            .send(userInvalidTest)
            expect(res.statusCode).toEqual(400)
        })

        it('Modify customer account with invalid fields method', async () => {
            let userClientModifyTest = {
                username: 'userModifyTest',
                birthdate: new Date(),
                phone: 1234567890,
                email: 'email',
            }

            const res = await request(app)
                .put(`/api/v1/users/${userClientTest._id}`)
                .send(userClientModifyTest)
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        }) 

        it('Modify customer account with invalid customer id', async () => {
            let userClientModifyTest = {
                username: 'userModifyTest',
                birthdate: new Date(),
                phone: 1234567890,
                email: 'email',
            }

            const res = await request(app)
                .put(`/api/v1/users/123`)
                .send(userClientModifyTest)
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        }) 

        it('Modify customer account with null customer id', async () => {
            let userClientModifyTest = {
                username: 'userModifyTest',
                birthdate: new Date(),
                phone: 1234567890,
                email: 'email',
            }

            const res = await request(app)
                .put(`/api/v1/users/${null}`)
                .send(userClientModifyTest)
                .set('Authorization', `Bearer ${authToken}`)
            expect(res.statusCode).toEqual(400)
        }) 

       it('Recover customer password with invalid fields method', async () => {
            let recoverPassword  = {
                newPassword: "P@ssw0rdNew"
            }

                const res = await request(app)
                .patch(`/api/v1/users/${userClientTest._id}/password`)
                .send(recoverPassword)
                expect(res.statusCode).toEqual(400)
        })

        
       it('Recover customer password with invalid customer id', async () => {
        let recoverPassword  = {
            newPassword: "P@ssw0rdNew"
        }

            const res = await request(app)
            .patch(`/api/v1/users/1235/password`)
            .send(recoverPassword)
            expect(res.statusCode).toEqual(400)
        })

        it('Recover customer password with null customer id', async () => {
            let recoverPassword  = {
                newPassword: "P@ssw0rdNew"
            }
    
                const res = await request(app)
                .patch(`/api/v1/users/${null}/password`)
                .send(recoverPassword)
                expect(res.statusCode).toEqual(400)
            })
    
    })
})