const axios = require('axios');
const { test, afterAll } = require('@jest/globals');

const testUser = {
    first_name: 'steve',
    last_name: 'man',
    email: '12312412@gmail.com',
    password: '123asda!Sdad',
    business_name: 'bikeerp',
    currency: 'CAD'
};

test('business registration', async (done) => {
    const res = await axios.post('http://localhost:3001/users/register-business', testUser);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('user');
    expect(res.data).toHaveProperty('business');
    global.business = res.data.business;
    global.user = res.data.user;
    done();
});

test('user login', async (done) => {
    const res = await axios.post('http://localhost:3001/users/login', { email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('user');
    expect(res.data).toHaveProperty('business');
    global.user = res.data.user;
    global.business = res.data.business;
    axios.defaults.headers['Authorization'] = `Bearer ${res.data.user.access_token}`;
    done();
});

require('./Users.js');
require('./Items.js');
require('./Locations.js');
require('./Accounts.js');
require('./Customers');

afterAll(async (done) => {
    await axios.post('http://localhost:3001/users/delete-business', { business_id: global.business.id });
    done();
});
