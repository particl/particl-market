import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([

        db.schema.createTableIfNotExists('identities', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.integer('profile_id').unsigned().notNullable();
            table.foreign('profile_id').references('id').inTable('profiles').onDelete('CASCADE');

            table.string('wallet'); // .notNullable().unique();
            table.string('identity_spaddress'); // .notNullable().unique();
            table.string('escrow_spaddress'); // .notNullable().unique();
            table.string('txfee_spaddress'); // .notNullable().unique();
            table.string('wallet_hdseedid'); // .notNullable().unique();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        }),

        // copy the old data from wallets -> identities
        // wallets.name -> identities.wallet
        db.schema.raw(
            'INSERT INTO identities (id, wallet, updated_at, created_at, profile_id)' +
            'SELECT id, name, updated_at, created_at, profile_id ' +
            'FROM markets_old')

    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('identities')
    ]);
};
