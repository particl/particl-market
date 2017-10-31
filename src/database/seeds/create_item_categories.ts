import * as Knex from 'knex';

exports.seed = async (db: Knex) => {
    console.log('seeding default item categories');

    await db('item_categories')
        .insert({name: 'root', description: 'root item category', default: true})
        .returning('id').then( async rootId => {
        await db('item_categories').insert({name: 'child1', description: 'child item category', parent_item_category_id: parseInt(rootId, 10), default: true});
        await db('item_categories').insert({name: 'child2', description: 'child item category', parent_item_category_id: parseInt(rootId, 10), default: true});
    });

};

