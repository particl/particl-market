"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('profiles', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable().unique();
            table.string('address').nullable();
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('profiles')
    ]);
};
//# sourceMappingURL=20171003141504_create_profiles_table.js.map