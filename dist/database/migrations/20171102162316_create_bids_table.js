"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('bids', (table) => {
            table.increments('id').primary();
            table.string('action').notNullable();
            table.string('bidder').notNullable();
            table.integer('listing_item_id').unsigned().notNullable();
            table.foreign('listing_item_id').references('id')
                .inTable('listing_items').onDelete('cascade');
            table.integer('address_id').unsigned().notNullable();
            table.foreign('address_id').references('id')
                .inTable('addresses');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('bids')
    ]);
};
//# sourceMappingURL=20171102162316_create_bids_table.js.map