// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { MarketService } from '../../services/model/MarketService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Market } from '../../models/Market';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MarketCreateRequest } from '../../requests/model/MarketCreateRequest';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import {MarketType} from '../../enums/MarketType';
import {MissingParamException} from '../../exceptions/MissingParamException';
import {InvalidParamException} from '../../exceptions/InvalidParamException';
import * as resources from "resources";
import * as _ from 'lodash';
import {ModelNotFoundException} from '../../exceptions/ModelNotFoundException';
import {MessageException} from '../../exceptions/MessageException';

export class MarketAddCommand extends BaseCommand implements RpcCommandInterface<Market> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService
    ) {
        super(Commands.MARKET_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: name
     *  [1]: type
     *  [2]: receiveKey
     *  [3]: receiveAddress
     *  [4]: publishKey, optional
     *  [5]: publishAddress, optional
     *
     * @param data
     * @returns {Promise<Market>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Market> {
        return this.marketService.create({
            name : data.params[0],
            private_key : data.params[1],
            address : data.params[2]
        } as MarketCreateRequest);
    }

    /**
     * data.params[]:
     *  [0]: name
     *  [1]: type
     *  [2]: receiveKey
     *  [3]: receiveAddress
     *  [4]: publishKey, optional
     *  [5]: publishAddress, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('name');
        } else if (data.params.length < 2) {
            throw new MissingParamException('type');
        } else if (data.params.length < 3) {
            throw new MissingParamException('receiveKey');
        } else if (data.params.length < 4) {
            throw new MissingParamException('receiveAddress');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('name', 'string');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('type', 'string');
        } else if (typeof data.params[2] !== 'string') {
            throw new InvalidParamException('receiveKey', 'string');
        } else if (typeof data.params[3] !== 'string') {
            throw new InvalidParamException('receiveAddress', 'string');
        } else if (data.params[4] && typeof data.params[4] !== 'string') {
            throw new InvalidParamException('publishKey', 'string');
        } else if (data.params[5] && typeof data.params[5] !== 'string') {
            throw new InvalidParamException('publishAddress', 'string');
        }

        // make sure required data exists and fetch it
        let listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0])
            .then(value => value.toJSON()); // throws if not found

        // make sure the ListingItemTemplate has a paymentAddress and generate and update it, if it doesn't
        // paymentAddress is part of the hash, so it needs to be created before the hash (unless it already exists)

        if (_.isEmpty(listingItemTemplate.PaymentInformation)) {
            throw new ModelNotFoundException('PaymentInformation');
        } else if (_.isEmpty(listingItemTemplate.PaymentInformation.ItemPrice)) {
            throw new ModelNotFoundException('ItemPrice');
        }

        // update the paymentAddress in case it's not generated yet
        if (!listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress
            || _.isEmpty(listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress)) {
            listingItemTemplate = await this.updatePaymentAddress(listingItemTemplate);
        }

        const market: resources.Market = await this.marketService.findOne(data.params[2])
            .then(value => value.toJSON()); // throws if not found

        // check size limit
        const templateMessageDataSize = await this.listingItemTemplateService.calculateMarketplaceMessageSize(listingItemTemplate);
        if (!templateMessageDataSize.fits) {
            throw new MessageException('ListingItemTemplate information exceeds message size limitations');
        }

        data.params[0] = listingItemTemplate;
        data.params[2] = market;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <name> <privateKey> <address> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <name>                   - String - The unique name of the market being created. \n'
            + '    <privateKey>             - String - The private key of the market being creted. \n'
            + '    <address>                - String - [TODO] ';
    }

    public description(): string {
        return 'Create a new market.';
    }

    public example(): string {
        return 'market ' + this.getName() + ' market add \'Dream Market\' \'InY0uRdr34M5\' \'lchudifyeqm4ldjj\' ';
    }
}
