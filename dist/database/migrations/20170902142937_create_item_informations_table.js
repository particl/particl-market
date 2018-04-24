"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('item_informations', (table) => {
            table.increments('id').primary();
            table.string('title').notNullable();
            table.text('short_description').notNullable();
            table.text('long_description').notNullable();
            table.integer('item_category_id').unsigned().nullable();
            table.foreign('item_category_id').references('id')
                .inTable('item_categories').onDelete('cascade');
            table.integer('listing_item_id').unsigned().nullable();
            table.foreign('listing_item_id').references('id')
                .inTable('listing_items').onDelete('cascade');
            table.integer('listing_item_template_id').unsigned().nullable();
            table.foreign('listing_item_template_id').references('id')
                .inTable('listing_item_templates').onDelete('cascade');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('item_informations')
    ]);
};
//# sourceMappingURL=20170902142937_create_item_informations_table.js.map