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
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ActionDirection } from '../../enums/ActionDirection';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { GovernanceAction } from '../../enums/GovernanceAction';
import { CommentAction } from '../../enums/CommentAction';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { CommandParamValidationRules } from '../BaseCommand';

export class SmsgSearchCommand extends BaseSearchCommand implements RpcCommandInterface<Bookshelf.Collection<SmsgMessage>> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) private smsgMessageService: SmsgMessageService
    ) {
        super(Commands.SMSG_SEARCH);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {} as CommandParamValidationRules;
        // TODO: implement
        /*
        return {
            parameters: [{
                name: 'listingItemId',
                required: false,
                type: 'number'
            }] as ParamValidationRule[]
        } as CommandParamValidationRules;
        */
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
     *  [2]: order, SearchOrder, ENUM{ASC/DESC}
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: types, ActionMessageTypes[], * for all, optional
     *  [5]: status, SmsgMessageStatus, ENUM{NEW, PARSING_FAILED, PROCESSING, PROCESSED, PROCESSING_FAILED, WAITING}, * for all
     *  [6]: direction, ActionDirection, ENUM{INCOMING, OUTGOING, BOTH}, * for all
     *  [7]: age, number, SmsgMessage SmsgMessage minimum message age in ms, default 2 min
     *  [8]: msgid, string, * for all, optional
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        let types = data.params[4];                 // optional
        let status = data.params[5];                // optional
        let direction = data.params[6];             // optional
        const age = data.params[7];                   // optional
        let msgid = data.params[8];                 // optional

        types = types === '*' ? undefined : types;
        status = status === '*' ? undefined : status;
        direction = direction === '*' ? undefined : direction;
        msgid = msgid === '*' ? undefined : msgid;

        // this.log.debug('data.params: ', JSON.stringify(data.params, null, 2));

        if (!_.isNil(types) && (!Array.isArray(types)
            || data.params[4].every(type => {
                return typeof type !== 'string'
                    || (!EnumHelper.containsValue(MPAction, type)
                        && !EnumHelper.containsValue(MPActionExtended, type)
                        && !EnumHelper.containsValue(GovernanceAction, type)
                        && !EnumHelper.containsValue(CommentAction, type));
            }))) {
            throw new InvalidParamException('type', 'ActionMessageTypes[]');
        } else if (!_.isNil(status) && (typeof status !== 'string' || !EnumHelper.containsValue(SmsgMessageStatus, status))) {
            throw new InvalidParamException('status', 'SmsgMessageStatus');
        } else if (!_.isNil(direction) && (typeof direction !== 'string' || !EnumHelper.containsValue(ActionDirection, direction))) {
            throw new InvalidParamException('direction', 'ActionDirection');
        } else if (!_.isNil(age) && !_.isNumber(age)) {
            throw new InvalidParamException('age', 'number');
        } else if (!_.isNil(msgid) && typeof msgid !== 'string') {
            throw new InvalidParamException('msgid', 'string');
        }

        data.params[4] = types;                 // optional
        data.params[5] = status;                // optional
        data.params[6] = direction;             // optional
        data.params[7] = age === undefined ? 2 * 60 * 1000 : age;
        data.params[8] = msgid;                 // optional

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
