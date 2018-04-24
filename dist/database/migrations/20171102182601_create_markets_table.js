"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('markets', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable().unique();
            table.string('private_key').notNullable();
            table.string('address').notNullable();
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('markets')
    ]);
};
//# sourceMappingURL=20171102182601_create_markets_table.js.map