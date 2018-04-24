"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('message_infos', (table) => {
            table.increments('id').primary();
            table.integer('action_message_id').notNullable();
            table.foreign('action_message_id').references('id')
                .inTable('action_messages').onDelete('cascade');
            table.string('address').nullable();
            table.string('memo').nullable();
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('message_infos')
    ]);
};
//# sourceMappingURL=20180205141250_create_message_infos_table.js.map