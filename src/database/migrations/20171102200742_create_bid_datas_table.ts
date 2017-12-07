import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('bid_datas', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('data_value');
            table.string('data_id');
            table.integer('bid_id').unsigned().notNullable();
            table.foreign('bid_id').references('id')
                .inTable('bids').onDelete('cascade');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('bid_datas')
    ]);
};
