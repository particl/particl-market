import { api, rpc, ApiOptions } from './api';
import * as Faker from 'faker';

export class BlackBoxTestUtil {


    constructor() {
        //
    }

    /**
     * clean the db, also seeds the default data
     *
     * @returns {Promise<void>}
     */
    public async cleanDb(ignoreTables: string[] = []): Promise<any> {
        ignoreTables.unshift('clean'); // push subcommand for cleadDB call
        const res = await rpc('data', ignoreTables);
        res.expectJson();
        res.expectStatusCode(200);
    }

    /**
     * add your custom data
     *
     * @param model
     * @param data
     * @returns {Promise<any>}
     */
    public async addData(model: string, data: any): Promise<any> {
        const res = await rpc('data', ['add', model, JSON.stringify(data)]);
        res.expectJson();
        res.expectStatusCode(200);
        return res;
    }

    /**
     * generate "real" looking test data
     *
     * @param model - listingitemtemplate, listingitem or profile
     * @param amount - amount of models to create
     * @param withRelated - return full related model data or just id's, defaults to true
     * @returns {Promise<any>}
     */
    public async generateData(model: string, amount: number = 1, withRelated: boolean = true): Promise<any> {
        const res: any = await rpc('data', ['generate', model, amount, withRelated]);
        res.expectJson();
        res.expectStatusCode(200);
        return res.getBody()['result'];
    }

    /**
     * get default profile
     *
     * @returns {Promise<any>}
     */
    public async getDefaultProfile(): Promise<any> {
        const res: any = await rpc('profile', ['get', 'DEFAULT']);
        res.expectJson();
        res.expectStatusCode(200);
        return res.getBody()['result'];
    }

}


