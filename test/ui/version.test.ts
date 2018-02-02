import { api } from './lib/api';
import * as build from '../../public/cli/build.json';

describe('Check deployed version', () => {

    // TODO: check for correct build version
    test('Should have a build version', async () => {

        const res: any = await api('GET', '/cli/build.json', {
            host: process.env.APP_HOST,
            port: process.env.APP_PORT
        });
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody();
        expect(result.version).toBe(build.version);
    });

});
