import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('location_markers', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('markerTitle').notNullable();
            table.text('markerText').notNullable();
            table.float('lat').notNullable();
            table.float('lng').notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('location_markers')
    ]);
};
