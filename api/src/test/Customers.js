const axios = require('axios');
const { test, afterAll, describe } = require('@jest/globals');

const customer = {
    first_name: 'Bill',
    last_name : 'Bobert',
    phone_number: '+1 (514) 728-9910',
    address: '7610 Newman Boulevard',
    city: 'Montreal',
    state: 'Quebec',
    country: 'Canada',
    postal_code: 'A2D 9f0',
    email: 'email@gmail.com',
};

const modifiedCustomer = {
    first_name: 'Billy',
    last_name : 'Boberto',
    phone_number: '+1 (514) 728-9910',
    address: '7610 Newman Boulevardy',
    city: 'Calgary',
    state: 'Alberta',
    country: 'Canada',
    postal_code: 'T1X 1E1',
    email: 'email2@gmail.com',
};

describe('customer controller', () => {

    test('customer creation', async (done) => {
        const res = await axios.post('http://localhost:3001/customers/create', customer);
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({ id: expect.any(String), ...customer, phone_number: expect.any(String) });
        Object.assign(customer, res.data);
        done();
    });

    test('customer modification', async (done) => {
        const res = await axios.put(`http://localhost:3001/customers/${customer.id}`, modifiedCustomer);
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({ id: expect.any(String), ...modifiedCustomer, phone_number: expect.any(String) });
        Object.assign(customer, res.data);
        done();
    });

    test('customer retrieval', async (done) => {
        const res = await axios.get(`http://localhost:3001/customers`);
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject([{ id: expect.any(String), ...modifiedCustomer, phone_number: expect.any(String) }]);
        done();
    });

    test('customer deletion', async (done) => {
        let res = await axios.post(`http://localhost:3001/customers/delete-multiple`, { customer_ids: [customer.id] });
        expect(res.status).toBe(200);
        res = await axios.get(`http://localhost:3001/customers`);
        expect(res.data).toMatchObject([]);
        done();
    });

    afterAll(async (done) => {
        await axios.delete(`http://localhost:3001/customers/${customer.id}`);
        done();
    });

});