"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('action_messages', (table) => {
            table.increments('id').primary();
            table.string('action').notNullable();
            table.string('nonce').nullable();
            table.boolean('accepted').nullable();
            table.integer('listing_item_id').notNullable();
            table.foreign('listing_item_id').references('id')
                .inTable('listing_items').onDelete('cascade');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('action_messages')
    ]);
};
//# sourceMappingURL=20180205141106_create_action_messages_table.js.map