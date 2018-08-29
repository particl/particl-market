// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemInformationService } from '../../services/ItemInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemInformationCreateRequest } from '../../requests/ItemInformationCreateRequest';
import { ItemInformation } from '../../models/ItemInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';

export class ItemInformationAddCommand extends BaseCommand implements RpcCommandInterface<ItemInformation> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) private itemInformationService: ItemInformationService
    ) {
        super(Commands.ITEMINFORMATION_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: title
     *  [2]: shortDescription
     *  [3]: longDescription
     *  [4]: categoryId
     *
     * TODO: should support also categorykey
     *
     * @param data
     * @returns {Promise<ItemInformation>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemInformation> {
        if (data.params.length < 5) {
            this.log.error('Not enough args.');
            throw new MessageException('Not enough args.');
        } else if (typeof data.params[0] !== 'number') {
            this.log.error('Listing template id must be numeric.');
            throw new MessageException('Listing template id must be numeric.');
        } else if (typeof data.params[4] !== 'number') {
            this.log.error('Category id must be numeric.');
            throw new MessageException('Category id must be numeric.');
        }
        return this.itemInformationService.create({
            listing_item_template_id: data.params[0],
            title: data.params[1],
            shortDescription: data.params[2],
            longDescription: data.params[3],
            itemCategory: {
                id: data.params[4]
            }
        } as ItemInformationCreateRequest);
    }

    public usage(): string {
        return this.getName() + ' <listingTemplateId> <title> <shortDescription> <longDescription> <categoryId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - Numeric - The ID of the listing item template we \n'
            + '                                     want to associate the created item information with. \n'
            + '    <title>                       - String - The title of the created item \n'
            + '                                     information. \n'
            + '    <shortDescription>            - String - A short description of the created \n'
            + '                                     item information. \n'
            + '    <longDescription>             - String - A long description of the created \n'
            + '                                     item information. \n'
            + '    <categoryId>                  - String - The id that identifies the item \n'
            + '                                     category we want to associate the created \n'
            + '                                     item information with. ';
    }

    public description(): string {
        return 'Create an iteminformation and associate it with a listingTemplateId.';
    }

    public example(): string {
        return 'information ' + this.getName() + ' 1 \'Midori Tabako packet\''
        + ' \'Cigarette packet\' \'You can\\\'t understand the runes, but the packet smells funny.\' 76';
    }
}
