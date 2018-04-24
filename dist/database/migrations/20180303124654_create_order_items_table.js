"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('order_items', (table) => {
            table.increments('id').primary();
            table.string('status').notNullable();
            table.string('item_hash').notNullable();
            table.integer('order_id').unsigned().notNullable();
            table.foreign('order_id').references('id')
                .inTable('orders');
            table.integer('bid_id').unsigned().notNullable();
            table.foreign('bid_id').references('id')
                .inTable('bids');
            // table.integer('listing_item_id').unsigned().notNullable();
            // table.foreign('listing_item_id').references('id')
            //    .inTable('listing_items');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('order_items')
    ]);
};
//# sourceMappingURL=20180303124654_create_order_items_table.js.map