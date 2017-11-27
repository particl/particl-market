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

    public async addTestProfile(): any {
        const res: any = await this.addData('profile', { name: 'TESTING-' + Faker.name.firstName() });
        return res.getBody()['result'];
    }
/*
    // add profile for testing
    const addDataRes: any = await testUtil.addData('profile', { name: 'TESTING-ADDRESS-PROFILE-NAME' });
profile = addDataRes.getBody()['result'];

// add listingitemtemplate for testing
const addDataRes: any = await testUtil.addData('listingitemtemplate', { name: 'TESTING-ADDRESS-PROFILE-NAME' });
profile = addDataRes.getBody()['result'];


*/

}


