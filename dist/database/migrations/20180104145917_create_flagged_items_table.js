"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('flagged_items', (table) => {
            table.increments('id').primary();
            table.integer('listing_item_id').unsigned().notNullable().unique();
            table.foreign('listing_item_id').references('id')
                .inTable('listing_items').onDelete('cascade');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('flagged_items')
    ]);
};
//# sourceMappingURL=20180104145917_create_flagged_items_table.js.map