// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { EscrowService } from '../../services/EscrowService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { EscrowCreateRequest } from '../../requests/EscrowCreateRequest';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { MessageException } from '../../exceptions/MessageException';
import * as _ from 'lodash';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';

export class EscrowAddCommand extends BaseCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.ESCROW_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     *  [1]: escrowtype
     *  [2]: buyer ratio
     *  [3]: seller ratio
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Escrow> {

        // get the template
        const listingItemTemplateId = data.params[0];
        const listingItemTemplateModel = await this.listingItemTemplateService.findOne(listingItemTemplateId);
        const listingItemTemplate = listingItemTemplateModel.toJSON();

        // creates an Escrow related to PaymentInformation related to ListingItemTemplate
        return this.escrowService.create({
            payment_information_id: listingItemTemplate.PaymentInformation.id,
            type: data.params[1],
            ratio: {
                buyer: data.params[2],
                seller: data.params[3]
            }
        } as EscrowCreateRequest);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        }
        if (data.params.length < 2) {
            throw new MissingParamException('escrowType');
        }
        if (data.params.length < 3) {
            throw new MissingParamException('buyerRatio');
        }
        if (data.params.length < 4) {
            throw new MissingParamException('sellerRatio');
        }

        // get the template
        const listingItemTemplateId = data.params[0];
        if (typeof listingItemTemplateId !== 'number' || listingItemTemplateId < 0) {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        }

        const escrowType = data.params[1];
        if (typeof escrowType !== 'string' || (escrowType !== 'NOP' && escrowType !== 'MAD')) {
            throw new InvalidParamException('escrowType', 'enum');
        }

        const buyerRatio = data.params[2];
        if (typeof buyerRatio !== 'number' || buyerRatio < 0) {
            throw new InvalidParamException('buyerRatio', 'number');
        }

        const sellerRatio = data.params[3];
        if (typeof sellerRatio !== 'number' || sellerRatio < 0) {
            throw new InvalidParamException('sellerRatio', 'number');
        }

        const listingItemTemplateModel = await this.listingItemTemplateService.findOne(listingItemTemplateId);
        const listingItemTemplate = listingItemTemplateModel.toJSON();

        // template allready has listingitems so for now, it cannot be modified
        if (listingItemTemplate.ListingItems.length > 0) {
            throw new MessageException(`Escrow cannot be added because ListingItems allready exist for the ListingItemTemplate.`);
        }

        this.log.debug('escrow: ', JSON.stringify(listingItemTemplate.PaymentInformation, null, 2));
        if (!_.isEmpty(listingItemTemplate.PaymentInformation.Escrow)) {
            throw new MessageException(`Escrow already exists.`);
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> <escrowType> <buyerRatio> <sellerRatio> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <listingItemTemplateId>  - Numeric - The ID of the listing item template we want \n'
            + '                                to associate with this escrow. \n'
            + '    <escrowType>             - Enum{NOP,MAD} - The type of the escrow we want to \n'
            + '                                create. \n'
            + '    <buyerRatio>             - Numeric - The ratio of the buyer in the escrow. \n'
            + '    <sellerRatio>            - Numeric - The ratio of the seller in the escrow. ';
    }

    public description(): string {
        return 'Create an escrow and associate it with a listingItemTemplate.';
    }

    public example(): string {
        return 'escrow ' + this.getName() + ' 1 MAD 1 1 ';
    }
}
