import { Knex } from '../config/Database';
import { DataDir } from '../core/helpers/DataDir';

export const migrate = (): Promise<any> => {

    const db = Knex();

    return Promise.all([
        db.migrate.latest(),
        db.destroy()
    ]);
};

export const initialize = (): Promise<any> => {
    DataDir.initialize();
    return exports.migrate;
};
