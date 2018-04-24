"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('item_images', (table) => {
            table.increments('id').primary();
            table.string('hash').notNullable();
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
        db.schema.dropTable('item_images')
    ]);
};
//# sourceMappingURL=20170902130728_create_item_images_table.js.map