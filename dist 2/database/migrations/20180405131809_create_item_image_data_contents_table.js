"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('item_image_data_contents', (table) => {
            table.increments('id').primary();
            table.string('data').notNullable();
            table.integer('item_image_data_id').unsigned();
            table.foreign('item_image_data_id').references('id')
                .inTable('item_image_datas').onDelete('cascade');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('item_image_data_contents')
    ]);
};
//# sourceMappingURL=20180405131809_create_item_image_data_contents_table.js.map