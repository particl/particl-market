// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { SmsgMessage } from '../../models/SmsgMessage';
import { SmsgMessageService } from '../../services/model/SmsgMessageService';
import { SmsgMessageSearchParams } from '../../requests/search/SmsgMessageSearchParams';
import { BaseSearchCommand } from '../BaseSearchCommand';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { SmsgMessageSearchOrderField } from '../../enums/SearchOrderField';
import { ActionDirection } from '../../enums/ActionDirection';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import {
    ActionMessageTypesValidationRule,
    CommandParamValidationRules,
    EnumValidationRule, NumberValidationRule,
    ParamValidationRule,
    StringValidationRule
} from '../CommandParamValidation';


export class SmsgSearchCommand extends BaseSearchCommand implements RpcCommandInterface<Bookshelf.Collection<SmsgMessage>> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) private smsgMessageService: SmsgMessageService
    ) {
        super(Commands.SMSG_SEARCH);
        this.log = new Logger(__filename);
        this.debug = false;
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new ActionMessageTypesValidationRule(false),
                new EnumValidationRule('status', false, 'SmsgMessageStatus', EnumHelper.getValues(SmsgMessageStatus) as string[]),
                new EnumValidationRule('direction', false, 'ActionDirection', EnumHelper.getValues(ActionDirection) as string[]),
                new NumberValidationRule('age', false, 2 * 60 * 1000),
                new StringValidationRule('msgid', false)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    public getAllowedSearchOrderFields(): string[] {
        return EnumHelper.getValues(SmsgMessageSearchOrderField) as string[];
    }

    /**
     *
     * data.params[]:
     *  [0]: page, number
     *  [1]: pageLimit, number, default=10
     *  [2]: order, SearchOrder, ASC/DESC, orders by createdAt
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: types, ActionMessageTypes[], * for all, optional
     *  [5]: status, SmsgMessageStatus, ENUM{NEW, PARSING_FAILED, PROCESSING, PROCESSED, PROCESSING_FAILED, WAITING}, * for all
     *  [6]: direction, ActionDirection, ENUM{INCOMING, OUTGOING, BOTH}, * for all
     *  [7]: age, number, SmsgMessage minimum message age in ms, default 2 min
     *  [8]: msgid, string, * for all, optional // todo: SmsgGetCommand
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<SmsgMessage>> {

        const searchParams = {
            page: data.params[0],
            pageLimit: data.params[1],
            order: data.params[2],
            orderField: data.params[3],
            types: data.params[4],
            status: data.params[5],
            direction: data.params[6],
            age: data.params[7],
            msgid: data.params[8]
        } as SmsgMessageSearchParams;

        this.log.debug('searchParams: ', JSON.stringify(searchParams, null, 2));

        return await this.smsgMessageService.searchBy(searchParams);
    }

    /**
     *
     * data.params[]:
     *  [0]: page, number
     *  [1]: pageLimit, number, default=10
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: types, ActionMessageTypes[], optional
     *  [5]: status, SmsgMessageStatus
     *  [6]: direction, ActionDirection
     *  [7]: age, number, SmsgMessage SmsgMessage minimum message age in ms, default 2 min
     *  [8]: msgid, string, optional
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);
        return data;
    }

    public usage(): string {
        return this.getName()
            + ' <page> <pageLimit> <order> <orderField> [types] [status] [direction] [age] [msgid] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <page>                   - Numeric - The number of result page we want to return. \n'
            + '    <pageLimit>              - Numeric - The number of results per page. \n'
            + '    <order>                  - SearchOrder - The order of the returned results. \n'
            + '    <orderField>             - CommentSearchOrderField - The field to order the results by. \n'
            + '    <types>                  - [optional] ActionMessageTypes[]. \n'
            + '    <status>                 - [optional] SmsgMessageStatus. \n'
            + '    <direction>              - [optional] ActionDirection. \n'
            + '    <age>                    - [optional] SmsgMessage max age. \n'
            + '    <msgid>                  - [optional] The message msgid. \n';

    }

    public description(): string {
            return 'Search for SmsgMessages.';
    }

    public example(): string {
        return 'smsg ' + this.getName() + ' 0 10 ASC';
    }
}
