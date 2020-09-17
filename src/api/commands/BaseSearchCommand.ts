// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { Command } from './Command';
import { RpcRequest } from '../requests/RpcRequest';
import { BaseCommand } from './BaseCommand';
import {
    CommandParamValidationRules, ParamValidationRule, SearchOrderFieldValidationRule, SearchOrderValidationRule,
    SearchPageLimitValidationRule, SearchPageValidationRule
} from './CommandParamValidation';


export abstract class BaseSearchCommand extends BaseCommand {

    public debug = false;

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
        return await super.validate(data, rules); // validates the basic params, see: BaseCommand.validate()
    }

    public getSearchCommandParamValidationRules(): CommandParamValidationRules {
        const rules = {
            params: [] as ParamValidationRule[]
        } as CommandParamValidationRules;

        const searchParameters = [
            new SearchPageValidationRule(),
            new SearchPageLimitValidationRule(),
            new SearchOrderValidationRule(),
            new SearchOrderFieldValidationRule(this.getAllowedSearchOrderFields())
        ] as ParamValidationRule[];

        const commandRules = this.getCommandParamValidationRules();
        rules.params = searchParameters.concat(commandRules.params);
        return rules;
    }

}
