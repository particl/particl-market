// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.blackbox' });
import { api } from './lib/api';
import { Logger as LoggerType } from '../../src/core/Logger';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';

describe('getnetworkinfo', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    test('Should connect to the particld daemon and successfully call getblockchaininfo', async () => {
        const rpcRequestBody = {
            method: 'getblockchaininfo',
            params: [],
            jsonrpc: '2.0'
        };
        const auth = 'Basic ' + Buffer.from(process.env.RPCUSER + ':' + process.env.RPCPASSWORD).toString('base64');
        const host = 'http://' + process.env.RPCHOSTNAME;
        const port = 52935;

        // instanceNumber = 1, since we're assuming we're runnign against the docker-compose/kontena environment
        const res: any = await api('POST', '/', {
            host,
            port,
            headers: {
                Authorization: auth
            },
            body: rpcRequestBody
        }, 0);

        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.chain).toBe('test');
    });

});
