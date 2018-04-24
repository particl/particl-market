"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('price_ticker', (table) => {
            table.increments('id').primary();
            table.string('crypto_id').notNullable();
            table.string('crypto_name').notNullable();
            table.string('crypto_symbol').notNullable();
            table.string('crypto_rank').notNullable();
            table.string('crypto_price_usd').notNullable();
            table.string('crypto_price_btc').notNullable();
            table.string('crypto_24_h_volume_usd');
            table.string('crypto_market_cap_usd');
            table.string('crypto_available_supply');
            table.string('crypto_total_supply');
            table.string('crypto_max_supply');
            table.string('crypto_percent_change_1_h');
            table.string('crypto_percent_change_24_h');
            table.string('crypto_percent_change_7_d');
            table.string('crypto_last_updated');
            table.string('crypto_price_eur');
            table.string('crypto_24_h_volume_eur');
            table.string('crypto_market_cap_eur');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('price_ticker')
    ]);
};
//# sourceMappingURL=20180103120342_create_price_ticker_table.js.map