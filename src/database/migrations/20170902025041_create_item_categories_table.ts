import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('item_categories', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('key').nullable().unique();
            table.string('name').nullable();
            table.text('description').nullable();

            table.integer('parent_item_category_id').unsigned().nullable();
            table.foreign('parent_item_category_id').references('id')
                .inTable('item_categories').onDelete('cascade');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('item_categories')
    ]);
};
