import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import * as _ from 'lodash';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { Notification } from '../../src/api/models/Notification';
import { NotificationService } from '../../src/api/services/model/NotificationService';
import { NotificationCreateRequest } from '../../src/api/requests/model/NotificationCreateRequest';
import { NotificationUpdateRequest } from '../../src/api/requests/model/NotificationUpdateRequest';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';


describe('Notification', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let notificationService: NotificationService;

    let notification: resources.Notification;

    const testData = {
        type: MPAction.MPA_BID,
        objectId: 1,
        objectHash: Faker.random.uuid(),
        from: Faker.random.uuid(),
        to: Faker.random.uuid(),
        target: Faker.random.uuid(),
        market: Faker.random.uuid(),
        read: false
    } as NotificationCreateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        notificationService = app.IoC.getNamed<NotificationService>(Types.Service, Targets.Service.model.NotifyService);



    });

    afterAll(async () => {
        //
    });

    test('Should create a new notification', async () => {
        notification = await notificationService.create(testData).then(value => value.toJSON());
        const result: resources.Notification = notification;

        expect(result.type).toBe(testData.type);
        expect(result.objectId).toBe(testData.objectId);
        expect(result.objectHash).toBe(testData.objectHash);
        expect(result.parentObjectId).toBe(testData.parentObjectId);
        expect(result.parentObjectHash).toBe(testData.parentObjectHash);
        expect(result.target).toBe(testData.target);
        expect(result.from).toBe(testData.from);
        expect(result.to).toBe(testData.to);
        expect(result.market).toBe(testData.market);
        expect(result.category).toBe(testData.category);
        expect(result.read).toBe(testData.read);
    });

    test('Should list Notifications with our new create one', async () => {
        const notifications: resources.Notification[] = await notificationService.findAll()
            .then(value => value.toJSON());
        expect(notifications.length).toBe(1);
    });

    test('Should list Notifications with our newly create one', async () => {

        const notifications: resources.Notification[] = await notificationService.findAll().then(value => value.toJSON());
        expect(notifications.length).toBe(1);

        const result = notifications[0];
        expect(result.type).toBe(testData.type);
        expect(result.objectId).toBe(testData.objectId);
        expect(result.objectHash).toBe(testData.objectHash);
        expect(result.parentObjectId).toBe(testData.parentObjectId);
        expect(result.parentObjectHash).toBe(testData.parentObjectHash);
        expect(result.target).toBe(testData.target);
        expect(result.from).toBe(testData.from);
        expect(result.to).toBe(testData.to);
        expect(result.market).toBe(testData.market);
        expect(result.category).toBe(testData.category);
        expect(result.read).toBe(testData.read);
    });

    test('Should return one notification', async () => {
        const result: resources.Notification = await notificationService.findOne(notification.id).then(value => value.toJSON());
        expect(result.type).toBe(testData.type);
        expect(result.objectId).toBe(testData.objectId);
        expect(result.objectHash).toBe(testData.objectHash);
        expect(result.parentObjectId).toBe(testData.parentObjectId);
        expect(result.parentObjectHash).toBe(testData.parentObjectHash);
        expect(result.target).toBe(testData.target);
        expect(result.from).toBe(testData.from);
        expect(result.to).toBe(testData.to);
        expect(result.market).toBe(testData.market);
        expect(result.category).toBe(testData.category);
        expect(result.read).toBe(testData.read);
    });

    test('Should update the notification', async () => {

        const testDataUpdated = {
            type: MPAction.MPA_BID,
            objectId: 2,
            objectHash: Faker.random.uuid(),
            from: Faker.random.uuid(),
            to: Faker.random.uuid(),
            target: Faker.random.uuid(),
            market: Faker.random.uuid(),
            read: false
        } as NotificationUpdateRequest;

        const result: resources.Notification = await notificationService.update(notification.id, testDataUpdated).then(value => value.toJSON());
        expect(result.type).toBe(testDataUpdated.type);
        expect(result.objectId).toBe(testDataUpdated.objectId);
        expect(result.objectHash).toBe(testDataUpdated.objectHash);
        expect(result.parentObjectId).toBe(testDataUpdated.parentObjectId);
        expect(result.parentObjectHash).toBe(testDataUpdated.parentObjectHash);
        expect(result.target).toBe(testDataUpdated.target);
        expect(result.from).toBe(testDataUpdated.from);
        expect(result.to).toBe(testDataUpdated.to);
        expect(result.market).toBe(testDataUpdated.market);
        expect(result.category).toBe(testDataUpdated.category);
        expect(result.read).toBe(testDataUpdated.read);
    });

    test('Should delete the Notification', async () => {
        expect.assertions(1);
        await notificationService.destroy(notification.id);
        await notificationService.findOne(notification.id).catch(e =>
            expect(e).toEqual(new NotFoundException(notification.id))
        );
    });

});
