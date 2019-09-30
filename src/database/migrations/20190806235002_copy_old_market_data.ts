import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([

        // copy the old data
        db.schema.raw(
            'INSERT INTO markets (id, name, type, receive_key, receive_address, ' +
            'publish_key, publish_address, updated_at, created_at, profile_id)' +
            'SELECT id, name, type, receive_key, receive_address, ' +
            'publish_key, publish_address, updated_at, created_at, profile_id ' +
            'FROM markets_old')
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
    ]);
};
