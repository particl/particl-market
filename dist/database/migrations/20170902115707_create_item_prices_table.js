"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('item_prices', (table) => {
            table.increments('id').primary();
            table.string('currency').notNullable();
            table.integer('base_price').notNullable();
            table.integer('payment_information_id').unsigned();
            table.foreign('payment_information_id').references('id')
                .inTable('payment_informations').onDelete('cascade');
            table.integer('cryptocurrency_address_id').unsigned().nullable();
            table.foreign('cryptocurrency_address_id').references('id')
                .inTable('cryptocurrency_addresses');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('item_prices')
    ]);
};
//# sourceMappingURL=20170902115707_create_item_prices_table.js.map