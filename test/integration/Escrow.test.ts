import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { Escrow } from '../../src/api/models/Escrow';
import { EscrowType } from '../../src/api/enums/EscrowType';

import { EscrowService } from '../../src/api/services/EscrowService';

describe('Escrow', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let escrowService: EscrowService;

    let createdId;

    const testData = {
        type: EscrowType.MAD,
        ratio: {
            buyer: 50,
            seller: 50
        }
    };

    const testDataUpdated = {
        type: EscrowType.NOP,
        ratio: {
            buyer: 100,
            seller: 100
        }
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        escrowService = app.IoC.getNamed<EscrowService>(Types.Service, Targets.Service.EscrowService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no payment_information_id', async () => {
        expect.assertions(1);
        await escrowService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new escrow', async () => {
        testData['payment_information_id'] = 0;
        const escrowModel: Escrow = await escrowService.create(testData);
        createdId = escrowModel.Id;

        const result = escrowModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.Ratio.buyer).toBe(testData.ratio.buyer);
        expect(result.Ratio.seller).toBe(testData.ratio.seller);

    });

    test('Should throw ValidationException because we want to create a empty escrow', async () => {
        expect.assertions(1);
        await escrowService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list escrows with our new create one', async () => {
        const escrowCollection = await escrowService.findAll();
        const escrow = escrowCollection.toJSON();
        expect(escrow.length).toBe(1);

        const result = escrow[0];

        expect(result.type).toBe(testData.type);
        expect(result.Ratio).toBe(undefined); // doesnt fetch related
    });

    test('Should return one escrow', async () => {
        const escrowModel: Escrow = await escrowService.findOne(createdId);
        const result = escrowModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.Ratio.buyer).toBe(testData.ratio.buyer);
        expect(result.Ratio.seller).toBe(testData.ratio.seller);
    });

    test('Should throw ValidationException because there is no payment_information_id', async () => {
        expect.assertions(1);
        await escrowService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the escrow', async () => {
        testDataUpdated['payment_information_id'] = 0;
        const escrowModel: Escrow = await escrowService.update(createdId, testDataUpdated);
        const result = escrowModel.toJSON();

        expect(result.type).toBe(testDataUpdated.type);
        expect(result.Ratio.buyer).toBe(testDataUpdated.ratio.buyer);
        expect(result.Ratio.seller).toBe(testDataUpdated.ratio.seller);
    });

    test('Should delete the escrow', async () => {
        expect.assertions(1);
        await escrowService.destroy(createdId);
        await escrowService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
