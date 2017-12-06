import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { BidData } from '../../src/api/models/BidData';

import { BidDataService } from '../../src/api/services/BidDataService';

describe('BidData', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let bidDataService: BidDataService;

    let createdId;

    const testData = {
        data_id: 'color',
        data_value: 'black'
    };

    const testDataUpdated = {
        data_id: 'color',
        data_value: 'black'
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        bidDataService = app.IoC.getNamed<BidDataService>(Types.Service, Targets.Service.BidDataService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });


    test('Should throw ValidationException because there is no bid_id', async () => {
        expect.assertions(1);
        await bidDataService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });


    test('Should create a new bid data', async () => {
        testData['bid_id'] = 1;
        const bidDataModel: BidData = await bidDataService.create(testData);
        createdId = bidDataModel.Id;

        const result = bidDataModel.toJSON();

        // test the values
        expect(result.dataId).toBe(testDataUpdated.data_id);
        expect(result.dataValue).toBe(testDataUpdated.data_value);
    });

    test('Should throw ValidationException because we want to create a empty bid data', async () => {
        expect.assertions(1);
        await bidDataService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list bid datas with our new create one', async () => {
        const bidDataCollection = await bidDataService.findAll();
        const bidData = bidDataCollection.toJSON();
        expect(bidData.length).toBe(1);

        const result = bidData[0];

        // test the values
        expect(result.dataId).toBe(testDataUpdated.data_id);
        expect(result.dataValue).toBe(testDataUpdated.data_value);
    });

    test('Should return one bid data', async () => {
        const bidDataModel: BidData = await bidDataService.findOne(createdId);
        const result = bidDataModel.toJSON();

        // test the values
        expect(result.dataId).toBe(testDataUpdated.data_id);
        expect(result.dataValue).toBe(testDataUpdated.data_value);
    });


    test('Should throw ValidationException because there is no bid_id', async () => {
        expect.assertions(1);
        await bidDataService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });


    test('Should update the bid data', async () => {
        testDataUpdated['bid_id'] = 1;
        const bidDataModel: BidData = await bidDataService.update(createdId, testDataUpdated);
        const result = bidDataModel.toJSON();

        // test the values
        expect(result.dataId).toBe(testDataUpdated.data_id);
        expect(result.dataValue).toBe(testDataUpdated.data_value);
    });

    test('Should delete the bid data', async () => {
        expect.assertions(1);
        await bidDataService.destroy(createdId);
        await bidDataService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
