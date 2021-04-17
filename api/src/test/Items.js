const axios = require('axios');
const { test, afterAll, describe } = require('@jest/globals');

const item = {
    name: 'mountain bike',
    description: 'thing with 2 wheels',
    type: 'end-product',
    image_url: 'https://images.google.com/bike/1',
    price: 982.22,
    variant_groups: []
};

const modifiedItem = {
    name: 'mountain bike two',
    description: 'thing with 2 wheels, some extra description here',
    type: 'end-product',
    image_url: 'https://images.google.com/bike/2',
    price: 123.44,
    variant_groups: []
};

describe('item controller', () => {

    test('item creation', async (done) => {
        const res = await axios.post('http://localhost:3001/items/create', item);
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({ id: expect.any(String), ...item });
        Object.assign(item, res.data);
        done();
    });

    test('item modification', async (done) => {
        const res = await axios.put(`http://localhost:3001/items/${item.id}`, modifiedItem);
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({ id: expect.any(String), ...modifiedItem });
        Object.assign(item, res.data);
        done();
    });

    test('item retrieval', async (done) => {
        const res = await axios.get(`http://localhost:3001/items`);
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject([{ id: expect.any(String), ...modifiedItem }]);
        done();
    });

    test('item deletion', async (done) => {
        let res = await axios.post(`http://localhost:3001/items/delete-multiple`, { item_ids: [item.id] });
        expect(res.status).toBe(200);
        res = await axios.get(`http://localhost:3001/items`);
        expect(res.data).toMatchObject([]);
        done();
    });

    afterAll(async (done) => {
        await axios.delete(`http://localhost:3001/items/${item.id}`);
        done();
    });

});
