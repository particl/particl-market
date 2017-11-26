import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('listing_item_templates', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('hash').nullable().unique();

            table.integer('profile_id').notNullable();
            table.foreign('profile_id').references('id')
                .inTable('profiles');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('listing_item_templates')
    ]);
};
