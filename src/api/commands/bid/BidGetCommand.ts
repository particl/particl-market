// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { Bid } from '../../models/Bid';
import { BidService } from '../../services/model/BidService';

export class BidGetCommand extends BaseCommand implements RpcCommandInterface<Bid> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.BidService) private bidService: BidService
    ) {
        super(Commands.BID_GET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [1]: id
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bid> {
        return await this.bidService.findOne(data.params[0])
            .catch(reason => {
                throw new ModelNotFoundException('Bid');
            });
    }

    /**
     * data.params[]:
     *  [1]: id
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('bidId');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('bidId', 'number');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <categoryId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <categoryId>                  - Numeric - The ID belonging to the Bid we want to retrive. \n';
    }

    public description(): string {
        return 'Command for retrieving a Bid.';
    }

    public example(): string {
        return 'category ' + this.getName() + ' 6 ';
    }
}
