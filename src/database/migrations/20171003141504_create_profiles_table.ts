import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('profiles', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('name').notNullable().unique();
            table.string('address').nullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('profile')
    ]);
};
