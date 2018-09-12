// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemInformationService } from '../../services/ItemInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemInformation } from '../../models/ItemInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';

export class ItemInformationGetCommand extends BaseCommand implements RpcCommandInterface<ItemInformation> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) private itemInformationService: ItemInformationService
    ) {
        super(Commands.ITEMINFORMATION_GET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *
     * @param data
     * @returns {Promise<ItemInformation>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemInformation> {
        return this.itemInformationService.findByItemTemplateId(data.params[0]);
    }

    /**
     * - should have 4 params
     * - if category has key, it cant be edited
     * - ...
     *
     * @param {RpcRequest} data
     * @returns {Promise<void>}
     */
    public async validate(data: RpcRequest): Promise<void> {
        if (data.params.length < 1) {
            this.log.error('ListingItemTemplate ID missing.');
            throw new MessageException('ListingItemTemplate ID missing.');
        } else if (typeof data.params[0] !== 'number') {
            this.log.error('ListingItemTemplate ID must be numeric.');
            throw new MessageException('ListingItemTemplate ID must be numeric.');
        }
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>       - Numeric - The listingItemTemplateId of the item information we want \n'
            + '                                     to retrieve.';
    }

    public description(): string {
        return 'Get an iteminformations and associated with it with a listingItemTemplateId.';
    }

    public example(): string {
        return 'information ' + this.getName() + ' 1';
    }
}
