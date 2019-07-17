import * from 'jest';
import * as resources from 'resources';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { WalletService } from '../../src/api/services/model/WalletService';
import { WalletCreateRequest } from '../../src/api/requests/model/WalletCreateRequest';
import { WalletUpdateRequest } from '../../src/api/requests/model/WalletUpdateRequest';

describe('Wallet', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let walletService: WalletService;

    let wallet: resources.Wallet;

    const testData = {
        name: 'TEST'
    } as WalletCreateRequest;

    const testDataUpdated = {
        name: 'TEST-UPDATED'
    } as WalletUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        walletService = app.IoC.getNamed<WalletService>(Types.Service, Targets.Service.model.WalletService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
    });

    afterAll(async () => {
        //
    });

    test('Should create a new wallet', async () => {
        wallet = await walletService.create(testData).then(value => value.toJSON());
        const result: resources.Wallet = wallet;

        expect(result.name).toBe(testData.name);
    });

    test('Should throw ValidationException because we want to create a empty wallet', async () => {
        expect.assertions(1);
        await walletService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list wallets with our new create one', async () => {
        const wallets: resources.Wallet[] = await walletService.findAll().then(value => value.toJSON());
        expect(wallets.length).toBe(1);

        const result = wallets[0];
        expect(result.name).toBe(testData.name);
    });

    test('Should return one wallet', async () => {
        const result: resources.Wallet = await walletService.findOne(wallet.id).then(value => value.toJSON());
        expect(result.name).toBe(testData.name);
    });

    test('Should update the wallet', async () => {
        const result: resources.Wallet = await walletService.update(wallet.id, testDataUpdated).then(value => value.toJSON());
        expect(result.name).toBe(testDataUpdated.name);
    });

    test('Should delete the wallet', async () => {
        expect.assertions(1);
        await walletService.destroy(wallet.id);
        await walletService.findOne(wallet.id).catch(e =>
            expect(e).toEqual(new NotFoundException(wallet.id))
        );
    });

});
