import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('item_informations', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('title').notNullable();
            table.text('shortDescription').notNullable();
            table.text('longDescription').notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('item_informations')
    ]);
};
