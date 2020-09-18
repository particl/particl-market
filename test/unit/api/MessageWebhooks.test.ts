// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as dotenv from 'dotenv';
import { MessageWebhooks } from '../../../src/api/messages/MessageWebhooks';

describe('MessageWebhooks', () => {

    beforeAll(async () => {
        dotenv.config({ path: '.env.test' });
    });

    test('Config should have been loaded', async () => {
        expect(process.env['WEBHOOK_TEST']).toBe('http://google.com');
    });

    test('MessageWebhooks should return undefined', async () => {
        const webhookUrl = MessageWebhooks.get('TEST2');
        expect(webhookUrl).toBeUndefined();
    });

    test('MessageWebhooks should return the correct url', async () => {
        const webhookUrl = MessageWebhooks.get('TEST');
        expect(webhookUrl).toBe('http://google.com');
    });

});
