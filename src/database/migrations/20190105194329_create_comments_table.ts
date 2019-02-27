import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('comments', (table: Knex.CreateTableBuilder) => {
            table.increments('id').unsigned().primary();

            table.integer('parent_comment_id').unsigned().nullable();
            table.foreign('parent_comment_id').references('id')
                .inTable('comments').onDelete('CASCADE');

            table.string('hash').notNullable();
            table.string('parent_hash').nullable();

            table.string('sender').notNullable();
            table.string('market_hash').notNullable();
            table.string('target').notNullable();

            table.string('message').nullable();

            table.string('comment_type').notNullable();

            table.timestamp('posted_at').notNullable();
            table.timestamp('updated_at').notNullable().defaultTo(db.fn.now());
            table.timestamp('received_at').notNullable().defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        // TODO add your migration scripts here
    ]);
};
