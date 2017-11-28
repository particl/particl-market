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
    public async cleanDb(): void {
        const res = await rpc('cleandb');
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
    public async addData(model: string, data: any): any {
        const res = await rpc('adddata', [model, JSON.stringify(data)]);
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
    public async generateData(model: string, amount?: number = 1, withRelated?: boolean = true): any {
        const res: any = await  rpc('generatedata', [model, amount, withRelated]);
        res.expectJson();
        res.expectStatusCode(200);
        return res.getBody()['result'];
    }

    /**
     * get default profile
     *
     * @returns {Promise<any>}
     */
    public async getDefaultProfile(): any {
        const res: any = await  rpc('getprofile', ['DEFAULT']);
        res.expectJson();
        res.expectStatusCode(200);
        return res.getBody()['result'];
    }

}


