"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('message_datas', (table) => {
            table.increments('id').primary();
            table.integer('action_message_id').notNullable();
            table.foreign('action_message_id').references('id')
                .inTable('action_messages').onDelete('cascade');
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
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('message_datas')
    ]);
};
//# sourceMappingURL=20180205141936_create_message_datas_table.js.map