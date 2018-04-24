"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('users', (table) => {
            table.increments('id').primary();
            table.string('first_name').notNullable();
            table.string('last_name').notNullable();
            table.string('email').notNullable().unique();
            table.string('auth_0_user_id').unique();
            table.string('picture');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('users')
    ]);
};
//# sourceMappingURL=20170120183349_create_users_table.js.map