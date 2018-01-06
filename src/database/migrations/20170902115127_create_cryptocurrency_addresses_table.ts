import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('cryptocurrency_addresses', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            // table.enu('type', EnumUtil.asArray( CryptocurrencyAddressType ));
            table.string('type').notNullable();
            table.string('address').notNullable();

            table.integer('profile_id').unsigned().nullable();
            table.foreign('profile_id').references('id').inTable('profiles').onDelete('cascade');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('cryptocurrency_addresses')
    ]);
};
