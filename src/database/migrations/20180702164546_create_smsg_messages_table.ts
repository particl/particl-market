import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('smsg_messages', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('type').notNullable();
            table.string('status').notNullable();
            table.string('msgid').notNullable();
            table.string('version').notNullable();
            table.dateTime('received').notNullable();
            table.dateTime('sent').notNullable();
            table.dateTime('expiration').notNullable();
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
