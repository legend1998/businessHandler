const db = require('./database.js');
const { formatTable } = require('../helpers/utils.js');

module.exports = {
    async getBusinessItems(businessID) {

        const items = await db('erp.item')
            .where('deleted', false)
            .where('business_id', businessID);
        formatTable(items);

        const variantGroups = await db('erp.variant_group')
            .where('deleted', false)
            .whereIn('item_id', items.map(i => i.id));
        formatTable(variantGroups);

        const variants = await db('erp.variant')
            .where('deleted', false)
            .whereIn('variant_group_id', variantGroups.map(g => g.id));
        formatTable(variants);

        variantGroups.forEach(g => g.variants = variants.filter(v => v.variant_group_id === g.id));
        items.forEach(i => i.variant_groups = variantGroups.filter(g => g.item_id === i.id));

        return items;

    },
    async getItems(itemIds) {
        const items = await db('erp.item')
            .where('deleted', false)
            .whereIn('id', itemIds);
        formatTable(items);

        const variantGroups = await db('erp.variant_group')
            .where('deleted', false)
            .whereIn('item_id', items.map(i => i.id));
        formatTable(variantGroups);

        const variants = await db('erp.variant')
            .where('deleted', false)
            .whereIn('variant_group_id', variantGroups.map(g => g.id));
        formatTable(variants);

        variantGroups.forEach(g => g.variants = variants.filter(v => v.variant_group_id === g.id));
        items.forEach(i => i.variant_groups = variantGroups.filter(g => g.item_id === i.id));

        return items;
    },
    whereLike(query, ...fields) {
        let words = String(query).trim().split(/\s+/g);
        return function () {
            for (let word of words)
                this.where(function () {
                    for (let field of fields)
                        this.orWhere(db.raw(`lower(${field}) like ?`, `%${word.toLowerCase()}%`));
                });
        };
    }
}
