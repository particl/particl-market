import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { MessagingInformation } from '../../src/api/models/MessagingInformation';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';

import { MessagingInformationService } from '../../src/api/services/MessagingInformationService';

describe('MessagingInformation', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let messagingInformationService: MessagingInformationService;

    let createdId;

    const testData = {
        protocol: MessagingProtocolType.SMSG,
        publicKey: 'publickey1'
    };

    const testDataUpdated = {
        protocol: MessagingProtocolType.SMSG,
        publicKey: 'publickey2'
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        messagingInformationService = app.IoC.getNamed<MessagingInformationService>(Types.Service, Targets.Service.MessagingInformationService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    test('Should create a new messaging information', async () => {
        const messagingInformationModel: MessagingInformation = await messagingInformationService.create(testData);
        createdId = messagingInformationModel.Id;

        const result = messagingInformationModel.toJSON();

        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('Should throw ValidationException because we want to create a empty messaging information', async () => {
        expect.assertions(1);
        await messagingInformationService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list messaging informations with our new create one', async () => {
        const messagingInformationCollection = await messagingInformationService.findAll();
        const messagingInformation = messagingInformationCollection.toJSON();
        expect(messagingInformation.length).toBe(1);

        const result = messagingInformation[0];

        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('Should return one messaging information', async () => {
        const messagingInformationModel: MessagingInformation = await messagingInformationService.findOne(createdId);
        const result = messagingInformationModel.toJSON();

        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('Should update the messaging information', async () => {
        const messagingInformationModel: MessagingInformation = await messagingInformationService.update(createdId, testDataUpdated);
        const result = messagingInformationModel.toJSON();

        expect(result.protocol).toBe(testDataUpdated.protocol);
        expect(result.publicKey).toBe(testDataUpdated.publicKey);
    });

    test('Should delete the messaging information', async () => {
        expect.assertions(1);
        await messagingInformationService.destroy(createdId);
        await messagingInformationService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
