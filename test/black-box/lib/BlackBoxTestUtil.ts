import { api, rpc, ApiOptions } from './api';
import * as Faker from 'faker';

export class BlackBoxTestUtil {


    constructor() {
        //
    }

    public async cleanDb(): void {
        const res = await rpc('cleandb');
        res.expectJson();
        res.expectStatusCode(200);
    }

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
    public async generateData(model: string, amount: number, withRelated: boolean): any {
        const res: any = await  rpc('adddata', [model, amount, withRelated]);
        res.expectJson();
        res.expectStatusCode(200);
        return res;
    }

}


