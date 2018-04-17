import { api, rpc, ApiOptions } from './api';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import * as _ from 'lodash';
import * as resources from 'resources';
import { LoggerConfig } from '../../../src/config/LoggerConfig';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { AddressType } from '../../../src/api/enums/AddressType';

import * as addressCreateRequestSHIPPING_OWN from '../../testdata/createrequest/addressCreateRequestSHIPPING_OWN.json';

export class BlackBoxTestUtil {

    public log: LoggerType = new LoggerType(__filename);
    private node;

    constructor(node: number = 0) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
        new LoggerConfig().configure();
        this.node = node;
    }

    /**
     * clean the db, also seeds the default data
     *
     * @returns {Promise<void>}
     */
    public async cleanDb(): Promise<any> {

        this.log.debug('cleanDb, this.node', this.node);
        const res = await this.rpc(Commands.DATA_ROOT.commandName, [Commands.DATA_CLEAN.commandName]);
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
        const res = await this.rpc(Commands.DATA_ROOT.commandName, [Commands.DATA_ADD.commandName, model.toString(), JSON.stringify(data)]);
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
        const res: any = await this.rpc(Commands.DATA_ROOT.commandName, params);
        res.expectJson();
        res.expectStatusCode(200);
        return res.getBody()['result'];
    }

    /**
     *
     * @param {boolean} generateShippingAddress, default true
     * @returns {Promise<"resources".Profile>}
     */
    public async getDefaultProfile(generateShippingAddress: boolean = true): Promise<resources.Profile> {
        const res: any = await this.rpc(Commands.PROFILE_ROOT.commandName, [Commands.PROFILE_GET.commandName, 'DEFAULT']);

        res.expectJson();
        res.expectStatusCode(200);

        const defaultProfile = res.getBody()['result'];

        if (_.isEmpty(defaultProfile.ShippingAddresses
            || _.find(defaultProfile.ShippingAddresses, (address: resources.Address) => {
                    return AddressType.SHIPPING_OWN === address.type;
        }) === undefined )) {

            if (generateShippingAddress) {
                this.log.debug('Adding a missing ShippingAddress for the default Profile.');

                // if default profile doesnt have a shipping address, add it
                // TODO: generate a random address
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
                const addressRes: any = await this.rpc(Commands.ADDRESS_ROOT.commandName, addCommandParams);
                addressRes.expectJson();
                addressRes.expectStatusCode(200);

            }

            // get the updated profile
            const profileRes: any = await this.rpc(Commands.PROFILE_ROOT.commandName, [Commands.PROFILE_GET.commandName, 'DEFAULT']);
            return profileRes.getBody()['result'];
        } else {
            return defaultProfile;
        }
    }

    /**
     * get default market
     *
     * @returns {Promise<any>}
     */
    public async getDefaultMarket(): Promise<resources.Market> {
        const res: any = await this.rpc(Commands.MARKET_ROOT.commandName, [Commands.MARKET_LIST.commandName]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Market[] = res.getBody()['result'];
        // get the commandType for the method name
        return _.find(result, o => o.name === 'DEFAULT');
    }

    public async rpc(method: string, params: any[] = []): Promise<any> {
        const response = await rpc(method, params, this.node);
        if (response.error) {
            this.log.debug(JSON.stringify(response.error.message));
        }
        return response;
    }

    public async waitFor(maxSeconds: number): Promise<boolean> {
        for (let i = 0; i < maxSeconds; i++) {
            await this.waitTimeOut(1000);
        }
        return true;
    }

    /**
     *
     * @param {string} method
     * @param {any[]} params
     * @param {number} maxSeconds
     * @param {number} waitForStatusCode
     * @param {string} waitForObjectProperty
     * @param waitForObjectPropertyValue
     * @returns {Promise<any>}
     */
    public async rpcWaitFor(method: string, params: any[] = [], maxSeconds: number = 10, waitForStatusCode: number = 200,
                            waitForObjectProperty?: string, waitForObjectPropertyValue?: any ): Promise<any> {

        for (let i = 0; i < maxSeconds; i++) {
            const response: any = await this.rpc(method, params);

            if (waitForStatusCode === response.res.statusCode) {
                if (waitForObjectProperty) {
                    const result = response.getBody()['result'];
                    const objectPropertyValue = _.get(result, waitForObjectProperty);

                    if (objectPropertyValue === waitForObjectPropertyValue) {
                        this.log.debug('statusCode === ' + waitForStatusCode + ' && ' + waitForObjectProperty + ' === ' + waitForObjectPropertyValue);
                        return response;
                    } else {
                        this.log.debug(waitForObjectProperty + ' !== ' + waitForObjectPropertyValue);
                    }
                } else {
                    this.log.debug('statusCode === ' + waitForStatusCode);
                    return response;
                }
            }

            // try again
            await this.waitTimeOut(1000);
        }
        return true;
    }

    private waitTimeOut(timeoutMs: number): Promise<void> {
        this.log.debug('waiting for ' + timeoutMs + 'ms');
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, timeoutMs);
        });
    }

}


