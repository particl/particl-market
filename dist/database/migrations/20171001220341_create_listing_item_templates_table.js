"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('listing_item_templates', (table) => {
            table.increments('id').primary();
            table.string('hash').nullable().unique();
            table.integer('profile_id').notNullable();
            table.foreign('profile_id').references('id')
                .inTable('profiles').onDelete('RESTRICT');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('listing_item_templates')
    ]);
};
//# sourceMappingURL=20171001220341_create_listing_item_templates_table.js.map