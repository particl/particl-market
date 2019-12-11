import * as Knex from 'knex';

exports.up = (db: Knex): Promise<any> => {
    return Promise.all([

        db.schema.table('proposals', (table: Knex.AlterTableBuilder) => {
            table.string('market').nullable();  // market hash
        })
/*
        db.schema.raw(
            'INSERT INTO identities (id, wallet, updated_at, created_at, profile_id, address, type)' +
            'SELECT w.id, w.name, w.updated_at, w.created_at, w.profile_id, p.address, "market"' +
            'FROM wallets_old w ' +
            'INNER JOIN profiles p ON w.profile_id = p.id')
*/
    ]);

};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
    ]);
};
