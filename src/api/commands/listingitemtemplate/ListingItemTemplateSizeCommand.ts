// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageSize } from '../../responses/MessageSize';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import {EscrowType} from 'omp-lib/dist/interfaces/omp-enums';
import {CryptoAddressType} from 'omp-lib/dist/interfaces/crypto';

export class ListingItemTemplateSizeCommand extends BaseCommand implements RpcCommandInterface<MessageSize> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_SIZE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<MessageSize> {

        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0])
            .then(value => value.toJSON());

        // template might not have a payment address (CryptocurrencyAddress) yet, so in that case we'll
        // add some data to get a more realistic result
        if (!listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress
            || _.isEmpty(listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress)) {
            listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress = {} as resources.CryptocurrencyAddress;

            if (EscrowType.MAD_CT === listingItemTemplate.PaymentInformation.Escrow.type) {
                listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress.address
                    = 'TetbeNoZDWJ6mMzMBy745BXQ84KntsNch58GWz53cqG6X5uupqNojqcoC7vmEguRPfC5QkpJsdbBnEcdXMLgJG2dAtoAinSdKNFWtB';
                listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress.type = CryptoAddressType.STEALTH;
            } else {
                listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress.address = 'pmnK6L2iZx9zLA6GAmd3BUWq6yKa53Lb8H';
                listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress.type = CryptoAddressType.NORMAL;
            }
        }

        return await this.listingItemTemplateService.calculateMarketplaceMessageSize(listingItemTemplate);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingTemplateId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - Numeric - The Id of the ListingItemTemplate. ';
    }

    public description(): string {
        return 'Calculate and return ListingItemTemplate size and whether it fits in a single SmsgMessage or not.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1';
    }
}
