// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { EscrowService } from '../../services/EscrowService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import * as resources from 'resources';

export class EscrowRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService
    ) {
        super(Commands.ESCROW_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        const listingItemTemplateId = data.params[0];
        const listingItemTemplateModel = await this.listingItemTemplateService.findOne(listingItemTemplateId);
        const listingItemTemplate: resources.ListingItemTemplate = listingItemTemplateModel.toJSON();

        return this.escrowService.destroy(listingItemTemplate.PaymentInformation.Escrow.id);
    }

    /**
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MessageException('Expected listingItemTemplateId but received no params.');
        }

        const listingItemTemplateId = data.params[0];
        if (typeof listingItemTemplateId !== 'number' || listingItemTemplateId < 0) {
            throw new MessageException('listingItemTemplateId must be a number and >= 0.');
        }

        const listingItemTemplateModel = await this.listingItemTemplateService.findOne(listingItemTemplateId);
        if (!listingItemTemplateModel) {
            throw new MessageException(`ListingItemTemplate with listingItemTemplateId = ${listingItemTemplateId} not found.`);
        }
        const listingItemTemplate: resources.ListingItemTemplate = listingItemTemplateModel.toJSON();

        // template allready has listingitems so for now, it cannot be modified
        if (listingItemTemplate.ListingItems.length > 0) {
            throw new MessageException(`Escrow cannot be deleted because ListingItems allready exist for the ListingItemTemplate.`);
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <listingItemTemplateId>  - Numeric - The ID belonging to the listing item \n'
            + '                                template that the escrow we want to delete is \n'
            + '                                associated with. ';
    }

    public description(): string {
        return 'Command for removing an escrow, identified by listingItemTemplateId.';
    }

    public example(): string {
        return 'escrow ' + this.getName() + ' 1 ';
    }
}
