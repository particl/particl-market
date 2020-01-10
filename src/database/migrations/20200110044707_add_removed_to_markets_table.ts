import * as Knex from 'knex';

exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.table('markets', (table: Knex.AlterTableBuilder) => {
            table.boolean('removed').notNullable().defaultTo(false);
        })
    ]);

};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
    ]);
};
