"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('shipping_prices', (table) => {
            table.increments('id').primary();
            table.integer('domestic').notNullable();
            table.integer('international').notNullable();
            table.integer('item_price_id').unsigned();
            table.foreign('item_price_id').references('id').inTable('item_prices').onDelete('cascade');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('shipping_prices')
    ]);
};
//# sourceMappingURL=20170902115422_create_shipping_prices_table.js.map