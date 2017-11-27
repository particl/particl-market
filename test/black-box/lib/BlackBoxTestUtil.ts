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

    public async addData(data: any): void {
        const res = await rpc('adddata');
        res.expectJson();
        res.expectStatusCode(200);
    }

}


