// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { ImageProcessing } from '../../../src/core/helpers/ImageProcessing';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ModelNotModifiableException } from '../../../src/api/exceptions/ModelNotModifiableException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import {MessageException} from '../../../src/api/exceptions/MessageException';

describe('IdentityAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const identityCommand = Commands.IMAGE_ROOT.commandName;
    const identityAddCommand = Commands.IMAGE_ADD.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let image: resources.Image;


    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

    });

    test('Not implemented yet', async () => {
        //
    });


    /*
    test('Should fail because missing profileId', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('xxx').getMessage());
    });

    test('Should fail because missing name', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityAddCommand,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('xxx').getMessage());
    });

    test('Should fail because invalid profileId', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityAddCommand,
            true,
            'name'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });


    test('Should fail because invalid name', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityAddCommand,
            profile.id,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('name', 'string').getMessage());
    });


    test('Should fail because Profile not found', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityAddCommand,
            0,
            'name'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });


    test('Should fail because duplicate name', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityAddCommand,
            profile.id,
            'name'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MessageException('Identity with the name already exists.').getMessage());
    });


    test('Should add a new Market Identity for Profile', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityAddCommand,
            profile.id,
            'name'
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Identity = res.getBody()['result'];
        identity = result;

        // log.debug('image: ', JSON.stringify(image, null, 2));
        expect(identity.name).toBe('X');
    });
    */
});
