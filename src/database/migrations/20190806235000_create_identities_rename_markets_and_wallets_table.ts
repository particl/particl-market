import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([

        db.schema.createTableIfNotExists('identities', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.integer('profile_id').unsigned().notNullable();
            table.foreign('profile_id').references('id').inTable('profiles').onDelete('CASCADE');

            table.string('type').notNullable();

            table.string('wallet').notNullable().unique();
            table.string('address'); // .notNullable().unique();
            table.string('hdseedid'); // .notNullable().unique();
            table.string('path').notNullable();
            table.string('mnemonic').nullable();
            table.string('passphrase').nullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        }),

        // drop the unique index
        db.schema.raw('DROP INDEX markets_receive_address_profile_id_unique'),

        // rename old markets and wallets tables
        db.schema.raw('ALTER TABLE markets RENAME TO markets_old'),
        db.schema.raw('ALTER TABLE wallets RENAME TO wallets_old')
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('identities')
    ]);
};
