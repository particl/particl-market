import { api, rpc, ApiOptions } from './api';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import * as _ from 'lodash';
import { Market, Profile } from 'resources';
import { LoggerConfig } from '../../../src/config/LoggerConfig';
import * as addressCreateRequestSHIPPING_OWN from '../../testdata/createrequest/addressCreateRequestSHIPPING_OWN.json';

export class BlackBoxTestUtil {

    constructor() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
        new LoggerConfig().configure();    }

    /**
     * clean the db, also seeds the default data
     *
     * @returns {Promise<void>}
     */
    public async cleanDb(): Promise<any> {
        const res = await rpc(Commands.DATA_ROOT.commandName, [Commands.DATA_CLEAN.commandName]);
        res.expectJson();
        res.expectStatusCode(200);
        return { result: 'success' };

    }

    /**
     * add your custom data
     *
     * @param model
     * @param data
     * @returns {Promise<any>}
     */
    public async addData(model: CreatableModel, data: any): Promise<any> {
        const res = await rpc(Commands.DATA_ROOT.commandName, [Commands.DATA_ADD.commandName, model.toString(), JSON.stringify(data)]);
        res.expectJson();
        res.expectStatusCode(200);
        return res.getBody()['result'];
    }

    /**
     * generate real looking test data
     *
     * @param model - CreatableModel
     * @param amount - amount of models to create
     * @param withRelated - return full related model data or just id's, defaults to true
     * @param generateParams
     * @returns {Promise<any>}
     */
    public async generateData(model: CreatableModel, amount: number = 1, withRelated: boolean = true, generateParams: boolean[] = []): Promise<any> {
        const params = [Commands.DATA_GENERATE.commandName, model.toString(), amount, withRelated]
            .concat(generateParams);
        const res: any = await rpc(Commands.DATA_ROOT.commandName, params);
        res.expectJson();
        res.expectStatusCode(200);
        return res.getBody()['result'];
    }

    /**
     * get default profile
     *
     * @returns {Promise<any>}
     */
    public async getDefaultProfile(): Promise<Profile> {
        const res: any = await rpc(Commands.PROFILE_ROOT.commandName, [Commands.PROFILE_GET.commandName, 'DEFAULT']);
        res.expectJson();
        res.expectStatusCode(200);

        const defaultProfile = res.getBody()['result'];

        if (_.isEmpty(defaultProfile.ShippingAddresses)) {

            // if default profile doesnt have a shipping address, add it
            const addCommandParams = [
                Commands.ADDRESS_ADD.commandName,
                defaultProfile.id,
                addressCreateRequestSHIPPING_OWN.firstName,
                addressCreateRequestSHIPPING_OWN.lastName,
                addressCreateRequestSHIPPING_OWN.title,
                addressCreateRequestSHIPPING_OWN.addressLine1,
                addressCreateRequestSHIPPING_OWN.addressLine2,
                addressCreateRequestSHIPPING_OWN.city,
                addressCreateRequestSHIPPING_OWN.state,
                addressCreateRequestSHIPPING_OWN.country,
                addressCreateRequestSHIPPING_OWN.zipCode
            ];

            // create address for default profile
            const addressRes: any = await rpc(Commands.ADDRESS_ROOT.commandName, addCommandParams);
            addressRes.expectJson();
            addressRes.expectStatusCode(200);

            // get the updated profile
            const res: any = await rpc(Commands.PROFILE_ROOT.commandName, [Commands.PROFILE_GET.commandName, 'DEFAULT']);
            return res.getBody()['result'];
        } else {
            return defaultProfile;
        }
    }

    /**
     * get default market
     *
     * @returns {Promise<any>}
     */
    public async getDefaultMarket(): Promise<Market> {
        const res: any = await rpc(Commands.MARKET_ROOT.commandName, [Commands.MARKET_LIST.commandName]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: Market[] = res.getBody()['result'];
        // get the commandType for the method name
        return _.find(result, o => o.name === 'DEFAULT');
    }
}


