"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('escrows', (table) => {
            table.increments('id').primary();
            table.string('type').notNullable();
            table.integer('payment_information_id').unsigned();
            table.foreign('payment_information_id').references('id')
                .inTable('payment_informations').onDelete('cascade');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('escrows')
    ]);
};
//# sourceMappingURL=20170902122830_create_escrows_table.js.map