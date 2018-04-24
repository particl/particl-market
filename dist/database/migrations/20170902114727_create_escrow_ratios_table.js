"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('escrow_ratios', (table) => {
            table.increments('id').primary();
            table.integer('buyer').notNullable();
            table.integer('seller').notNullable();
            table.integer('escrow_id').unsigned();
            table.foreign('escrow_id').references('id')
                .inTable('escrows').onDelete('cascade');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('escrow_ratios')
    ]);
};
//# sourceMappingURL=20170902114727_create_escrow_ratios_table.js.map