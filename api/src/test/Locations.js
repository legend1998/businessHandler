const axios = require('axios');
const { test, afterAll, describe } = require('@jest/globals');

const location = {
    name: 'apple computers',
    address: '7610 Newman Boulevard',
    city: 'Montreal',
    state: 'Quebec',
    country: 'Canada',
    postal_code: 'A2D 9f0',
    phone_number: '+1 (514) 728-9910',
    type: 'store',
    latitude: 85,
    longitude: -15
};

const modifiedLocation = {
    name: 'apple computers two',
    address: '453 Woodcrest drive',
    city: 'Montreal',
    state: 'Quebec',
    country: 'Canada',
    postal_code: 'B3D 7H6',
    phone_number: '+1 (514) 123-4567',
    type: 'warehouse',
    latitude: 20,
    longitude: -80
};

describe('location controller', () => {

    test('location creation', async (done) => {
        const res = await axios.post('http://localhost:3001/locations/create', location);
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({ id: expect.any(String), ...location, phone_number: expect.any(String) });
        Object.assign(location, res.data);
        done();
    });

    test('location modification', async (done) => {
        const res = await axios.put(`http://localhost:3001/locations/${location.id}`, modifiedLocation);
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({ id: expect.any(String), ...modifiedLocation, phone_number: expect.any(String) });
        Object.assign(location, res.data);
        done();
    });

    test('location retrieval', async (done) => {
        const res = await axios.get(`http://localhost:3001/locations`);
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject([{ id: expect.any(String), ...modifiedLocation, phone_number: expect.any(String) }]);
        done();
    });

    test('location deletion', async (done) => {
        let res = await axios.post(`http://localhost:3001/locations/delete-multiple`, { location_ids: [location.id] });
        expect(res.status).toBe(200);
        res = await axios.get(`http://localhost:3001/locations`);
        expect(res.data).toMatchObject([]);
        done();
    });

    afterAll(async (done) => {
        await axios.delete(`http://localhost:3001/locations/${location.id}`);
        done();
    });

});
