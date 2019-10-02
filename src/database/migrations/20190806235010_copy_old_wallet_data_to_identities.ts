import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([

        // copy the old data from wallets & profiles -> identities
        // wallets.id -> identities.id
        // wallets.name -> identities.wallet
        // profile.address -> identities.identity_spaddress

        db.schema.raw(
            'INSERT INTO identities (id, wallet, updated_at, created_at, profile_id, identity_spaddress)' +
            'SELECT w.id, w.name, w.updated_at, w.created_at, w.profile_id, p.address ' +
            'FROM wallets_old w ' +
            'INNER JOIN profiles p ON w.profile_id = p.id')
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('identities')
    ]);
};
