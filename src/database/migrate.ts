import { Knex } from '../config/Database';
import { DataDir } from '../core/helpers/DataDir';
import { DevelopmentEnvConfig } from '../config/env/DevelopmentEnvConfig';

export const migrate = (): Promise<any> => {

    console.log('Running DB migrations...');
    console.log('process.env.DB_CONNECTION:', process.env.DB_CONNECTION);
    console.log('process.env.DB_MIGRATION_DIR:', process.env.DB_MIGRATION_DIR);
    console.log('process.env.DB_SEEDS_DIR:', process.env.DB_SEEDS_DIR);

    console.log('migrate, datadir: ', DataDir.getDataDirPath());
    console.log('migrate, database: ', DataDir.getDatabasePath());
    console.log('migrate, uploads: ', DataDir.getUploadsPath());

    const db = Knex();

    // migrate is a bluebird promise, hack around it
    return Promise.all([
        db.migrate.latest()
    ]);
};

export const initialize = (): Promise<any> => {
    DataDir.initialize(new DevelopmentEnvConfig());
    return exports.migrate;
};
