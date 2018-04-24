"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('shipping_destinations', (table) => {
            table.increments('id').primary();
            table.string('country', 3).notNullable();
            table.string('shipping_availability').notNullable();
            table.integer('item_information_id').unsigned().nullable();
            table.foreign('item_information_id').references('id')
                .inTable('item_informations').onDelete('cascade');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('shipping_destinations')
    ]);
};
//# sourceMappingURL=20170902144748_create_shipping_destinations_table.js.map