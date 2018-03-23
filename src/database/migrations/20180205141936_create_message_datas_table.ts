import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('message_datas', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('msgid').notNullable();
            table.string('version').notNullable();
            table.dateTime('received').notNullable();
            table.dateTime('sent').notNullable();
            table.string('from').notNullable();
            table.string('to').notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('message_datas')
    ]);
};
