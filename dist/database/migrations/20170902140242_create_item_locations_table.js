"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('item_locations', (table) => {
            table.increments('id').primary();
            table.string('region'); // .notNullable();
            table.string('address'); // .notNullable();
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
        db.schema.dropTable('item_locations')
    ]);
};
//# sourceMappingURL=20170902140242_create_item_locations_table.js.map