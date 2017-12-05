import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { EscrowRatio } from '../../src/api/models/EscrowRatio';

import { EscrowRatioService } from '../../src/api/services/EscrowRatioService';

describe('EscrowRatio', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let escrowRatioService: EscrowRatioService;

    let createdId;

    const testData = {
        buyer: 50,
        seller: 50
    };

    const testDataUpdated = {
        buyer: 100,
        seller: 100
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        escrowRatioService = app.IoC.getNamed<EscrowRatioService>(Types.Service, Targets.Service.EscrowRatioService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no escrow_id', async () => {
        expect.assertions(1);
        await escrowRatioService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new escrow ratio', async () => {
        testData['escrow_id'] = 0;
        const escrowRatioModel: EscrowRatio = await escrowRatioService.create(testData);
        createdId = escrowRatioModel.Id;

        const result = escrowRatioModel.toJSON();

        expect(result.buyer).toBe(testData.buyer);
        expect(result.seller).toBe(testData.seller);
    });

    test('Should throw ValidationException because we want to create a empty escrow ratio', async () => {
        expect.assertions(1);
        await escrowRatioService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list escrow ratios with our new create one', async () => {
        const escrowRatioCollection = await escrowRatioService.findAll();
        const escrowRatio = escrowRatioCollection.toJSON();
        expect(escrowRatio.length).toBe(1);

        const result = escrowRatio[0];

        expect(result.buyer).toBe(testData.buyer);
        expect(result.seller).toBe(testData.seller);
    });

    test('Should return one escrow ratio', async () => {
        const escrowRatioModel: EscrowRatio = await escrowRatioService.findOne(createdId);
        const result = escrowRatioModel.toJSON();

        expect(result.buyer).toBe(testData.buyer);
        expect(result.seller).toBe(testData.seller);
    });

    test('Should throw ValidationException because there is no escrow_id', async () => {
        expect.assertions(1);
        await escrowRatioService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the escrow ratio', async () => {
        testDataUpdated['escrow_id'] = 0;
        const escrowRatioModel: EscrowRatio = await escrowRatioService.update(createdId, testDataUpdated);
        const result = escrowRatioModel.toJSON();

        expect(result.buyer).toBe(testDataUpdated.buyer);
        expect(result.seller).toBe(testDataUpdated.seller);
    });

    test('Should delete the escrow ratio', async () => {
        expect.assertions(1);
        await escrowRatioService.destroy(createdId);
        await escrowRatioService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
