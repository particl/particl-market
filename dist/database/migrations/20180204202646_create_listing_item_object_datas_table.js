"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('listing_item_object_datas', (table) => {
            table.increments('id').primary();
            table.string('key').notNullable();
            table.string('value').notNullable();
            table.integer('listing_item_object_id').unsigned().nullable();
            table.foreign('listing_item_object_id').references('id')
                .inTable('listing_item_objects').onDelete('cascade');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('listing_item_object_datas')
    ]);
};
//# sourceMappingURL=20180204202646_create_listing_item_object_datas_table.js.map