import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('order_item_objects', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('dataId').notNullable();
            table.string('dataValue').notNullable();

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
