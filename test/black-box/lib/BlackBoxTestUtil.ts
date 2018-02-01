import { api, rpc, ApiOptions } from './api';
import * as Faker from 'faker';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';

export class BlackBoxTestUtil {

    constructor() {
        //
    }

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
    public async getDefaultProfile(): Promise<any> {
        const res: any = await rpc(Commands.PROFILE_ROOT.commandName, [Commands.PROFILE_GET.commandName, 'DEFAULT']);
        res.expectJson();
        res.expectStatusCode(200);
        return res.getBody()['result'];
    }

}


