"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('order_item_objects', (table) => {
            table.increments('id').primary();
            table.string('data_id').notNullable();
            table.string('data_value').notNullable();
            table.integer('order_item_id').unsigned().notNullable();
            table.foreign('order_item_id').references('id')
                .inTable('order_items');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('order_item_objects')
    ]);
};
//# sourceMappingURL=20180303124828_create_order_item_objects_table.js.map