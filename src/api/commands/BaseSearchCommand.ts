// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { Command } from './Command';
import { RpcRequest } from '../requests/RpcRequest';
import {BaseCommand, CommandParamValidationRules, ParamValidationRule} from './BaseCommand';
import { InvalidParamException } from '../exceptions/InvalidParamException';
import { EnumHelper } from '../../core/helpers/EnumHelper';
import { SearchOrder } from '../enums/SearchOrder';

export abstract class BaseSearchCommand extends BaseCommand {

    constructor(command: Command) {
        super(command);
    }

    /**
     * Should return the orderFields which are allowed for this particular Command
     *
     * Create a StringEnum where:
     *   key is the value passed for the Command and
     *   value being the db field for the Model class
     * see CommentSearchOrderField
     */
    public abstract getAllowedSearchOrderFields(): string[];

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        const rules = this.getSearchCommandParamValidationRules();
        return await super.validate(data, rules)
            .then(async value => {

                // validate checks the searchparams based on paramValidationRules
                const page = value.params[0];
                const pageLimit = value.params[1];
                const order = value.params[2];
                const orderField = value.params[3];

                // valid SearchOrder?
                if (!EnumHelper.containsName(SearchOrder, order)) {
                    throw new InvalidParamException('order', 'SearchOrder');
                }

                // valid orderField?
                if (!_.includes(this.getAllowedSearchOrderFields(), orderField)) {
                    throw new InvalidParamException('orderField',  '' + this.getAllowedSearchOrderFields());
                }
                return data;
            }); // validates the basic params, see: BaseCommand.validate()
    }

    public getSearchCommandParamValidationRules(): CommandParamValidationRules {
        const rules = {
            parameters: [] as ParamValidationRule[]
        } as CommandParamValidationRules

        const searchParameters = [{
            name: 'page',
            required: true,
            type: 'number'
        }, {
            name: 'pageLimit',
            required: true,
            type: 'number'
        }, {
            name: 'order',
            required: true,
            type: 'string'
        }, {
            name: 'orderField',
            required: true,
            type: 'string'
        }] as ParamValidationRule[];

        const commandRules = this.getCommandParamValidationRules();
        rules.parameters = searchParameters.concat(commandRules.parameters);
        return rules;
    }

}
