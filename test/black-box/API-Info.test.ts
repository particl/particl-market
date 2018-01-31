import { api } from './lib/api';

describe('getnetworkinfo', () => {

    test('Should connect to the particld daemon and successfully call getblockchaininfo', async () => {
        const rpcRequestBody = {
            method: 'getblockchaininfo',
            params: [],
            jsonrpc: '2.0'
        };
        const auth = 'Basic ' + new Buffer(process.env.RPCUSER + ':' + process.env.RPCPASSWORD).toString('base64');
        const res: any = await api('POST', '/', {
            host: process.env.RPCHOSTNAME,
            port: process.env.TESTNET_PORT,
            headers: {
                Authorization: auth
            },
            body: rpcRequestBody
        });
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.chain).toBe('test');
    });

});
