// Copyright (c) 2017-2019, The Particl Market developers
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
import { SearchOrder } from '../../enums/SearchOrder';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { SmsgMessage } from '../../models/SmsgMessage';
import { SmsgMessageService } from '../../services/model/SmsgMessageService';
import { SmsgMessageSearchParams } from '../../requests/SmsgMessageSearchParams';

export class SmsgSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<SmsgMessage>> {

    public log: LoggerType;
    private DEFAULT_PAGE_LIMIT = 10;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) private smsgMessageService: SmsgMessageService
    ) {
        super(Commands.SMSG_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     *
     * data.params[]:
     *  [0]: page, number, optional
     *  [1]: pageLimit, number, default=10, optional
     *  [2]: ordering ASC/DESC, orders by createdAt, optional
     *  [3]: type, MessageTypeEnum, * for all, optional
     *  [4]: status, ENUM{NEW, PARSING_FAILED, PROCESSING, PROCESSED, PROCESSING_FAILED, WAITING}, * for all
     *  [5]: smsgid, string, * for all, optional
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<SmsgMessage>> {

        const searchParams = this.getSearchParams(data.params);
        return await this.smsgMessageService.searchBy(searchParams);
    }

    public usage(): string {
        return this.getName()
            + ' [<page> [<pageLimit> [<ordering> [<type> [<status> [<msgid>]]]]]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <page>                   - [optional] Numeric - The number page we want to \n'
            + '                                view of searchBy listing item results. \n'
            + '    <pageLimit>              - [optional] Numeric - The number of results per page. \n'
            + '    <ordering>               - [optional] ENUM{ASC,DESC} - The ordering of the searchBy results. \n'
            + '    <type>                   - [optional] ENUM{ASC,DESC} - MessageType. \n'
            + '    <status>                 - [optional] ENUM{ASC,DESC} - SmsgMessageStatus. \n'
            + '    <msgid>                  - [optional] ENUM{ASC,DESC} - The message msgid. \n';

    }

    public description(): string {
            return 'Search bids by itemhash, bid status, or bidder address';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' TODO';
    }

    /**
     * data.params[]:
     *  [0]: page, number, optional
     *  [1]: pageLimit, number, default=10, optional
     *  [2]: ordering ASC/DESC, orders by createdAt, optional
     *  [3]: type, MessageTypeEnum, * for all, optional
     *  [4]: status, ENUM{NEW, PARSING_FAILED, PROCESSING, PROCESSED, PROCESSING_FAILED, WAITING}, * for all
     *  [5]: smsgid, string, * for all, optional
     *
     * @param {any[]} params
     * @returns {SmsgMessageSearchParams}
     */
    private getSearchParams(params: any[]): SmsgMessageSearchParams {

        let page = 0;
        let pageLimit = this.DEFAULT_PAGE_LIMIT;
        let ordering: SearchOrder = SearchOrder.ASC;
        let types: any = [];
        let status;
        let msgid;

        if (!_.isEmpty(params)) {
            if (typeof params[0] !== 'number') {
                throw new MessageException('page should be a number.');
            } else {
                page = params.shift();
            }
        }

        if (!_.isEmpty(params)) {
            if (typeof params[0] !== 'number') {
                throw new MessageException('pageLimit should be a number.');
            } else {
                pageLimit = params.shift();
            }
        }

        if (!_.isEmpty(params)) {
            if (typeof params[0] !== 'string') {
                throw new MessageException('ordering should be a string.');
            } else {
                if (params[0] === 'DESC') {
                    ordering = SearchOrder.DESC;
                } else {
                    ordering = SearchOrder.ASC;
                }
                params.shift();
            }
        }

        if (!_.isEmpty(params)) {
            types = [params.shift()];
        }

        if (!_.isEmpty(params)) {
            status = params.shift();
        }

        if (!_.isEmpty(params)) {
            msgid = params.shift();
        }

        const searchParams = {
            page,
            pageLimit,
            order: ordering,
            orderByColumn: 'received',
            types,
            status,
            msgid,
            age: 1000 * 30
        } as SmsgMessageSearchParams;

        this.log.debug('SmsgMessageSearchParams: ', JSON.stringify(searchParams, null, 2));
        return searchParams;
    }
}
