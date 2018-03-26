import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('listing_item_object_datas', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('key').notNullable();
            table.string('value').notNullable();

            table.integer('listing_item_object_id').unsigned().nullable();
            table.foreign('listing_item_object_id').references('id')
                .inTable('listing_item_objects').onDelete('cascade');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('listing_item_object_datas')
    ]);
};
