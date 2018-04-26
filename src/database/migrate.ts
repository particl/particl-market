import { Knex } from '../config/Database';
import { DataDir } from '../core/helpers/DataDir';

export const migrate = (): Promise<any> => {

    const db = Knex();

    // migrate is a bluebird promise, hack around it
    return Promise.all([
        db.migrate.latest()
    ]);
};

export const initialize = (): Promise<any> => {
    DataDir.initialize();
    return exports.migrate;
};
