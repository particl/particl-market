"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('bid_datas', (table) => {
            table.increments('id').primary();
            table.string('data_value');
            table.string('data_id');
            table.integer('bid_id').unsigned().notNullable();
            table.foreign('bid_id').references('id')
                .inTable('bids').onDelete('cascade');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('bid_datas')
    ]);
};
//# sourceMappingURL=20171102200742_create_bid_datas_table.js.map