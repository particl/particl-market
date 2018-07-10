import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('proposals', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('submitter').notNullable();
            table.integer('blockStart').notNullable();
            table.integer('blockEnd').notNullable();
            table.dateTime('createdAt').notNullable();
            table.string('hash').notNullable();
            table.string('type').notNullable();
            table.text('description').notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('proposals')
    ]);
};
