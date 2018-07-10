import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('proposal_option_results', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.integer('proposalResultId').notNullable();
            table.integer('proposalOptionId').notNullable();
            table.decimal('weight').notNullable();
            table.integer('voterCount').notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('proposal_option_results')
    ]);
};
