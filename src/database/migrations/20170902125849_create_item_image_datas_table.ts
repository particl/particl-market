import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('item_image_datas', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('data_id'); // .notNullable();
            table.string('protocol'); // .notNullable();
            table.string('encoding'); // .notNullable();
            table.text('data_big'); // .notNullable();
            table.text('data_medium'); // .notNullable();
            table.text('data_thumbnail'); // .notNullable();

            table.integer('item_image_id').unsigned();
            table.foreign('item_image_id').references('id')
                .inTable('item_images').onDelete('cascade');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('item_image_datas')
    ]);
};
