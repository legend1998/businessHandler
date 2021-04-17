const axios = require('axios');
const { expect, test } = require('@jest/globals');

const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;

describe('user controller', () => {

    test('refresh access token', async (done) => {
        const res = await axios.post('http://localhost:3001/users/refresh-token', { refresh_token: global.user.refresh_token });
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({
            access_token: expect.stringMatching(jwtRegex),
            refresh_token: expect.stringMatching(jwtRegex)
        });
        global.user.refresh_token = res.data.refresh_token;
        global.user.access_token = res.data.access_token;
        axios.defaults.headers['Authorization'] = `Bearer ${res.data.access_token}`;
        done();
    });

    test('send email verification for password reset', async (done) => {
        const res = await axios.post('http://localhost:3001/users/send-verification', { email: global.user.email });
        expect(res.status).toBe(200);
        done();
    });

    test('get the current user', async (done) => {
        const res = await axios.get('http://localhost:3001/users/current-user');
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({
            user: {
                id: expect.any(String),
                first_name: expect.any(String),
                last_name: expect.any(String),
                email: expect.any(String),
            },
            business: {
                id: global.user.business_id,
                owner_id: global.user.id,
                name: expect.any(String),
                currency: expect.any(String),
            }
        });
        Object.assign(global.user, res.data.user);
        Object.assign(global.business, res.data.business);
        done();
    });

    test('password reset', async (done) => {
        const res = await axios.post('http://localhost:3001/users/reset-password', { reset_guid: global.user.reset_guid, password: '123asda!SdadS$@#1d' });
        expect(res.status).toBe(200);
        global.user.password = '123asda!SdadS$@#1d';
        done();
    });

    test('revoke refresh token', async (done) => {
        let res = await axios.post('http://localhost:3001/users/revoke-token', { refresh_token: global.user.refresh_token });
        expect(res.status).toBe(200);

        res = await axios.post('http://localhost:3001/users/login', { email: global.user.email, password: global.user.password });
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({
            user: {
                id: expect.any(String),
                first_name: expect.any(String),
                last_name: expect.any(String),
                email: expect.any(String),
            },
            business: {
                id: global.user.business_id,
                owner_id: global.user.id,
                name: expect.any(String),
                currency: expect.any(String),
            }
        });
        global.user = res.data.user;
        global.business = res.data.business;
        axios.defaults.headers['Authorization'] = `Bearer ${res.data.user.access_token}`;
        done();
    });

});
