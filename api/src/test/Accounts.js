const axios = require('axios');
const { test, afterAll, describe } = require('@jest/globals');

const account = {
    first_name: 'Test',
    last_name: 'Account',
    email: '1234123123asdasd@gmail.com',
    type: 'admin'
};

const modifiedAccount = {
    first_name: 'Modified Test',
    last_name: 'Account Two',
    type: 'employee'
};

describe('account controller', () => {

    test('account creation', async (done) => {
        const res = await axios.post('http://localhost:3001/accounts/create', account);
        expect(res.status).toBe(201);
        expect(res.data).toMatchObject({ id: expect.any(String), ...account });
        Object.assign(account, res.data);
        done();
    });

    test('account modification', async (done) => {
        const res = await axios.put(`http://localhost:3001/accounts/${account.id}`, modifiedAccount);
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({ id: expect.any(String), ...modifiedAccount });
        Object.assign(account, res.data);
        done();
    });

    test('account retrieval', async (done) => {
        const res = await axios.get(`http://localhost:3001/accounts`);
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject([{ id: expect.any(String), ...modifiedAccount }]);
        done();
    });

    test('account deletion', async (done) => {
        let res = await axios.post(`http://localhost:3001/accounts/delete-multiple`, { user_ids: [account.id] });
        expect(res.status).toBe(200);
        res = await axios.get(`http://localhost:3001/accounts`);
        expect(res.data).toMatchObject([]);
        done();
    });

    afterAll(async (done) => {
        await axios.delete(`http://localhost:3001/accounts/${account.id}`);
        done();
    });

});
