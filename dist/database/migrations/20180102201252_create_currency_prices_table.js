"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('currency_prices', (table) => {
            table.increments('id').primary();
            table.string('from').notNullable();
            table.string('to').notNullable();
            table.float('price').notNullable();
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('currency_prices')
    ]);
};
//# sourceMappingURL=20180102201252_create_currency_prices_table.js.map