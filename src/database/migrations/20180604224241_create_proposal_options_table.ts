import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('proposal_options', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.integer('proposalId').notNullable();
            table.integer('optionId').notNullable();
            table.string('description').notNullable();
            table.string('hash').notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('proposal_options')
    ]);
};
