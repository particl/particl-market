import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('smsg_messages', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('type').notNullable();
            table.string('status').notNullable();
            table.string('msgid').notNullable().unique();
            table.string('version').notNullable();
            table.timestamp('received').notNullable();
            table.timestamp('sent').notNullable();
            table.timestamp('expiration').notNullable();
            table.integer('daysretention').notNullable();
            table.string('from').notNullable();
            table.string('to').notNullable();
            table.text('text').nullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('smsg_messages')
    ]);
};
