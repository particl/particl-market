import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('order_item_objects', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('data_id').notNullable();
            table.string('data_value').notNullable();

            table.integer('order_item_id').unsigned().notNullable();
            table.foreign('order_item_id').references('id')
                .inTable('order_items');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('order_item_objects')
    ]);
};
