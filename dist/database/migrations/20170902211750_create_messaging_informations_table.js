"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('messaging_informations', (table) => {
            table.increments('id').primary();
            table.string('protocol').notNullable();
            table.text('public_key').notNullable();
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
        db.schema.dropTable('messaging_informations')
    ]);
};
//# sourceMappingURL=20170902211750_create_messaging_informations_table.js.map