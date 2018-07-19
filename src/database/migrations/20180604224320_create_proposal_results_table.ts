import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('proposal_results', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.integer('proposal_id').unsigned().notNullable();
            table.foreign('proposal_id').references('id')
                .inTable('proposals').onDelete('cascade');

            table.integer('block').notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('proposal_results')
    ]);
};
