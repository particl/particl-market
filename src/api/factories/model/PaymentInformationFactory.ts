// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:max-line-length
import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { PaymentInformationCreateRequest } from '../../requests/model/PaymentInformationCreateRequest';
import { EscrowCreateRequest } from '../../requests/model/EscrowCreateRequest';
import { EscrowRatioCreateRequest } from '../../requests/model/EscrowRatioCreateRequest';
import { ItemPriceCreateRequest } from '../../requests/model/ItemPriceCreateRequest';
import { ShippingPriceCreateRequest } from '../../requests/model/ShippingPriceCreateRequest';
import { CryptocurrencyAddressCreateRequest } from '../../requests/model/CryptocurrencyAddressCreateRequest';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { EscrowConfig, EscrowRatio, PaymentInfo, PaymentOption, ShippingPrice } from 'omp-lib/dist/interfaces/omp';
import { ModelFactoryInterface } from '../ModelFactoryInterface';
import { ListingItemCreateParams } from '../ModelCreateParams';
import { CryptoAddress, Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { MessageException } from '../../exceptions/MessageException';
// tslint:enable:max-line-length


export class PaymentInformationFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * create a PaymentInformationCreateRequest
     *
     * @param params
     */
    public async get(params: ListingItemCreateParams): Promise<PaymentInformationCreateRequest> {

        const listingItemAddMessage = params.actionMessage as ListingItemAddMessage;
        const payment: PaymentInfo = listingItemAddMessage.item.payment;

        const escrow = payment.escrow ? await this.getModelEscrow(params) : undefined;
        const itemPrice = payment.options ? await this.getModelItemPrice(params) : undefined;

        return {
            type: payment.type,
            escrow,
            itemPrice
        } as PaymentInformationCreateRequest;
    }

    private async getModelItemPrice(params: ListingItemCreateParams): Promise<ItemPriceCreateRequest> {

        const listingItemAddMessage = params.actionMessage as ListingItemAddMessage;
        const smsgMessage = params.smsgMessage;

        const paymentOptions: PaymentOption[] = listingItemAddMessage.item.payment.options || [];

        // todo: this needs to be refactored
        const paymentOption: PaymentOption | undefined = _.find(paymentOptions, (option: PaymentOption) => {
            return option.currency === Cryptocurrency.PART;
        });

        if (!paymentOption) {
            this.log.error('There needs to be a PaymentOption for PART');
            throw new MessageException('There needs to be a PaymentOption for PART');
        }

        const shippingPrice = await this.getModelShippingPrice(paymentOption.shippingPrice);

        const cryptocurrencyAddress = paymentOption.address ? await this.getModelCryptocurrencyAddress(paymentOption.address) : undefined;

        return {
            currency: paymentOption.currency,
            basePrice: paymentOption.basePrice,
            shippingPrice,
            cryptocurrencyAddress
        } as ItemPriceCreateRequest;
    }

    private async getModelShippingPrice(shippingPrice: ShippingPrice): Promise<ShippingPriceCreateRequest> {
        return {
            domestic: shippingPrice.domestic,
            international: shippingPrice.international
        } as ShippingPriceCreateRequest;
    }

    private async getModelCryptocurrencyAddress(cryptocurrencyAddress: CryptoAddress): Promise<CryptocurrencyAddressCreateRequest> {
        return {
            type: cryptocurrencyAddress.type,
            address: cryptocurrencyAddress.address
        } as CryptocurrencyAddressCreateRequest;
    }

    private async getModelEscrow(params: ListingItemCreateParams): Promise<EscrowCreateRequest> {

        const listingItemAddMessage = params.actionMessage as ListingItemAddMessage;

        const escrow: EscrowConfig | undefined = listingItemAddMessage.item.payment.escrow;
        let ratio: EscrowRatioCreateRequest | undefined;

        if (!_.isNil(escrow) && !_.isNil(escrow.ratio)) {
            ratio = await this.getModelEscrowRatio(escrow.ratio);
        }

        return {
            type: (escrow && escrow.type) ? escrow.type : undefined,
            ratio,
            releaseType: (escrow && escrow.releaseType) ? escrow.releaseType : undefined,
            secondsToLock: (escrow && escrow.secondsToLock) ? escrow.secondsToLock : undefined
        } as EscrowCreateRequest;
    }

    private async getModelEscrowRatio(ratio: EscrowRatio): Promise<EscrowRatioCreateRequest> {
        return {
            buyer: ratio.buyer,
            seller: ratio.seller
        } as EscrowRatioCreateRequest;
    }

}
