"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('message_escrows', (table) => {
            table.increments('id').primary();
            table.integer('action_message_id').notNullable();
            table.foreign('action_message_id').references('id')
                .inTable('action_messages').onDelete('cascade');
            table.string('type').nullable();
            table.string('rawtx').nullable();
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('message_escrows')
    ]);
};
//# sourceMappingURL=20180205141333_create_message_escrows_table.js.map