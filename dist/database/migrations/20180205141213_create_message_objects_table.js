"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('message_objects', (table) => {
            table.increments('id').primary();
            table.integer('action_message_id').unsigned();
            table.foreign('action_message_id').references('id')
                .inTable('action_messages').onDelete('cascade');
            table.string('data_id').notNullable();
            table.string('data_value').nullable();
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('message_objects')
    ]);
};
//# sourceMappingURL=20180205141213_create_message_objects_table.js.map