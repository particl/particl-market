import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('item_image_data_contents', (table: Knex.CreateTableBuilder) => {
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

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('item_image_data_contents')
    ]);
};
