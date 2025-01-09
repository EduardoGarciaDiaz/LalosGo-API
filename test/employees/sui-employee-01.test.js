const request = require('supertest');
const app = require('../../src/index');
const mongoose = require('mongoose');
const Employee = require('../../src/models/User');
const Branch = require('../../src/models/Branch');
const bcrypt = require('bcrypt');

describe('Employee API Success Cases', () => {
    let authToken = '';
    let adminUser = null;

    const TEST_PASSWORD = 'AdminTest_001';
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
        branchStatus: true,
        branchProducts: []
    }

    let employeeTest = {
        _id: '',
        username: 'employee01',
        fullname: 'Employee Test',
        birthdate: new Date('1990-01-01'),
        phone: '2288892128',
        email: 'employee@gmail.com',
        password: 'P@ssw0rd',
        employee: {
            role: 'Delivery Person',
            hiredDate: new Date()
        }
    }

    beforeAll(async () => {
        await Employee.deleteMany({})
        await Branch.deleteMany({})
        const userData = await createAdminUserData()
        adminUser = await Employee.create(userData)
        branchTest = await Branch.create(branchTest)
        employeeTest.employee.branch = branchTest._id
    })

    afterAll(async () => {
        await Employee.deleteMany({})
        await Branch.deleteMany({})
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

    describe('Success actions', () => {
        it('Create Employee', async () => {
            const res = await request(app)
                .post('/api/v1/employees')
                .send({
                    username: employeeTest.username,
                    fullname: employeeTest.fullname,
                    birthdate: employeeTest.birthdate,
                    phone: employeeTest.phone,
                    email: employeeTest.email,
                    password: employeeTest.password,
                    employee: {
                        role: employeeTest.employee.role,
                        hiredDate: employeeTest.employee.hiredDate,
                        branch: employeeTest.employee.branch
                    }
                })
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(201)
            expect(res.body.username).toEqual(employeeTest.username)
            employeeTest._id = res.body._id
        })

        it('Update Employee data', async () => {
            const employeeUpdatedName = 'Employee Test Updated'
            const res = await request(app)
                .put(`/api/v1/employees/${employeeTest._id}`)
                .send({
                    username: employeeTest.username,
                    fullname: employeeUpdatedName,
                    birthdate: employeeTest.birthdate,
                    phone: employeeTest.phone,
                    email: employeeTest.email,
                    password: employeeTest.password,
                    employee: {
                        role: employeeTest.employee.role,
                        hiredDate: employeeTest.employee.hiredDate,
                        branch: employeeTest.employee.branch
                    }
                })
                .set('Authorization', `Bearer ${authToken}`)
            
            expect(res.statusCode).toEqual(200)
            expect(res.body.fullname).toEqual(employeeUpdatedName)
        })

        it('Get all employees', async () => {
            const res = await request(app)
                .get('/api/v1/employees')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(200)
            expect(Array.isArray(res.body.employees)).toBeTruthy()
            expect(res.body.employees.length).toBeGreaterThan(0)
        })

        it('Get specific employee', async () => {
            const res = await request(app)
                .get(`/api/v1/employees/${employeeTest._id}`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(200)
            expect(res.body.username).toEqual(employeeTest.username)
        })

        it('Update employee status', async () => {
            const res = await request(app)
                .patch(`/api/v1/employees/${employeeTest._id}`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(200)
            expect(res.body.status).toEqual('Inactive')
        })

    })
})
