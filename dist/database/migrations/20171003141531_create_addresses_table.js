"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('addresses', (table) => {
            table.increments('id').primary();
            table.string('first_name').nullable();
            table.string('last_name').nullable();
            table.string('title').nullable();
            table.string('address_line_1').notNullable();
            table.string('address_line_2').nullable();
            table.string('city').notNullable();
            table.string('state').notNullable();
            table.string('country').notNullable();
            table.string('zip_code').notNullable();
            table.string('type').notNullable();
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
        db.schema.dropTable('addresses')
    ]);
};
//# sourceMappingURL=20171003141531_create_addresses_table.js.map