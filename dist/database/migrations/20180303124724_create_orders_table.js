"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('orders', (table) => {
            table.increments('id').primary();
            table.string('hash').notNullable();
            table.string('buyer').notNullable();
            table.string('seller').notNullable();
            table.integer('address_id').unsigned().notNullable();
            // table.foreign('address_id').references('id')
            //    .inTable('addresses');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('orders')
    ]);
};
//# sourceMappingURL=20180303124724_create_orders_table.js.map