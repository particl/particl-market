import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('addresses', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('title').nullable();
            table.string('address_line_1').notNullable();
            table.string('address_line_2').notNullable();
            table.string('city').notNullable();
            table.string('country').notNullable();

            table.integer('profile_id').unsigned().notNullable();
            table.foreign('profile_id').references('id')
                .inTable('profiles').onDelete('CASCADE');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('address')
    ]);
};
