import { Knex } from '../config/Database';


exports.migrate = (): Promise<any> => {
    const db = Knex();
    return Promise.all([
        db.migrate.latest(),
        db.destroy()
    ]);
};


