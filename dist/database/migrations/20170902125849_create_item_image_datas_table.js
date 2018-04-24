"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('item_image_datas', (table) => {
            table.increments('id').primary();
            table.string('protocol'); // .notNullable();
            table.string('encoding'); // .notNullable();
            table.string('image_version'); // .notNullable();
            table.string('data_id'); // .notNullable();
            table.text('data'); // .notNullable();
            table.integer('item_image_id').unsigned();
            table.foreign('item_image_id').references('id')
                .inTable('item_images').onDelete('cascade');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
            table.string('original_mime'); // .notNullable();
            table.string('original_name'); // .notNullable();
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('item_image_datas')
    ]);
};
//# sourceMappingURL=20170902125849_create_item_image_datas_table.js.map