import { Knex } from '../config/Database';

import { DataDir } from '../core/helpers/DataDir';

export const migrate = (): Promise<any> => {

    console.log('Running DB migrations...');
    console.log('process.env.DB_CONNECTION:', process.env.DB_CONNECTION);

    console.log('migrate, datadir: ', DataDir.getDataDirPath());
    console.log('migrate, database: ', DataDir.getDatabasePath());
    console.log('migrate, uploads: ', DataDir.getUploadsPath());

    const database = Knex();

    // migrate is a bluebird promise, hack around it
    return Promise.all([
        database.migrate.latest()
    ]);
};

export const initialize = (): Promise<any> => {
    DataDir.initialize();
    return exports.migrate;
};
