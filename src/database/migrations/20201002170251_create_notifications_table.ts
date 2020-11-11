import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('notifications', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('type').nullable();
            table.integer('objectId').nullable();
            table.string('objectHash').nullable();
            table.integer('parentObjectId').nullable();
            table.string('parentObjectHash').nullable();
            table.string('target').nullable();
            table.string('from').nullable();
            table.string('to').nullable();
            table.string('market').nullable();
            table.string('category').nullable();
            table.boolean('read').defaultTo(false);

            table.integer('profile_id').unsigned().nullable();
            table.foreign('profile_id').references('id')
                .inTable('profiles').onDelete('cascade');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('notifications')
    ]);
};
