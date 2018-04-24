"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('shopping_cart', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.integer('profile_id').unsigned().notNullable();
            table.foreign('profile_id').references('id')
                .inTable('profiles').onDelete('CASCADE');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('shopping_cart')
    ]);
};
//# sourceMappingURL=20180003185516_create_shopping_cart_table.js.map