"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('item_categories', (table) => {
            table.increments('id').primary();
            table.string('key').nullable().unique();
            table.string('name').nullable();
            table.text('description').nullable();
            table.integer('parent_item_category_id').unsigned().nullable();
            table.foreign('parent_item_category_id').references('id')
                .inTable('item_categories').onDelete('cascade');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('item_categories')
    ]);
};
//# sourceMappingURL=20170902025041_create_item_categories_table.js.map