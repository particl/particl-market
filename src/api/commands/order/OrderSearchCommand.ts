// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { OrderService } from '../../services/model/OrderService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { Order } from '../../models/Order';
import { SearchOrder } from '../../enums/SearchOrder';
import { OrderSearchParams } from '../../requests/OrderSearchParams';

export class OrderSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Order>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.OrderService) private orderService: OrderService
    ) {
        super(Commands.ORDER_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: itemhash, optional
     * [1]: status, optional
     * [2]: buyerAddress, optional
     * [3]: sellerAddress, optional
     * [4]: ordering, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<Bookshelf.Collection<Order>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Order>> {
        const listingItemHash = data.params[0] !== '*' ? data.params[0] : undefined;
        const status = data.params[1] !== '*' ? data.params[1] : undefined;
        const buyerAddress = data.params[2] !== '*' ? data.params[2] : undefined;
        const sellerAddress = data.params[3] !== '*' ? data.params[3] : undefined;
        let ordering = data.params[4];

        if (!ordering) {
            ordering = SearchOrder.ASC;
        }

        const searchArgs = {
            listingItemHash,
            status,
            buyerAddress,
            sellerAddress,
            ordering
        } as OrderSearchParams;

        return await this.orderService.search(searchArgs);
    }

    public usage(): string {
        return this.getName() + ' [(<itemhash>|*) [(<status>|*) [(<buyerAddress>|*) [(<sellerAddress>|*) [<ordering>]]]]]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to searchBy orders for. \n'
            + '                                A value of * specifies that any item hash is acceptable. \n'
            + '    <status>                 - [optional] ENUM{AWAITING_ESCROW,ESCROW_LOCKED,SHIPPING,COMPLETE} - \n'
            + '                                The status of the orders we want to searchBy for \n'
            + '                                A value of * specifies that any order status is acceptable. \n'
            + '    <buyerAddress>           - [optional] String - The address of the buyer in the orders we want to searchBy for. \n'
            + '                                A value of * specifies that any buyer address is acceptable. \n'
            + '    <sellerAddress>          - [optional] String - The address of the seller in the orders we want to searchBy for. \n'
            + '                                A value of * specifies that any seller address is acceptable. \n'
            + '    <ordering>               - [optional] ENUM{ASC,DESC} - The ordering of the searchBy results. ';
    }

    public description(): string {
        return 'Search for orders by item hash, order status, or addresses. ';
    }

    public example(): string {
        return 'TODO';
    }
}
