import { api, rpc, ApiOptions } from './api';

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

}


