import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([

        db.schema.createTableIfNotExists('identities', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.integer('profile_id').unsigned().notNullable();
            table.foreign('profile_id').references('id').inTable('profiles').onDelete('CASCADE');

            table.string('wallet').notNullable().unique();
            table.string('identity_spaddress'); // .notNullable().unique();
            table.string('escrow_spaddress'); // .notNullable().unique();
            table.string('txfee_spaddress'); // .notNullable().unique();
            table.string('wallet_hdseedid'); // .notNullable().unique();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        }),

        // drop the unique index
        db.schema.raw('DROP INDEX markets_receive_address_profile_id_unique'),

        // rename old markets table
        db.schema.raw('ALTER TABLE markets RENAME TO markets_old')
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('identities')
    ]);
};
