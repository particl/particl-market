"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('shopping_cart_item', (table) => {
            table.increments('id').primary();
            table.integer('shopping_cart_id').unsigned().notNullable();
            table.foreign('shopping_cart_id').references('id')
                .inTable('shopping_cart').onDelete('cascade');
            table.integer('listing_item_id').unsigned().notNullable();
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('shopping_cart_item')
    ]);
};
//# sourceMappingURL=20180003190458_create_shopping_cart_item_table.js.map