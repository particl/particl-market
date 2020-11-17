// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { ValidationException } from '../../exceptions/ValidationException';
import { PaymentInformationRepository } from '../../repositories/PaymentInformationRepository';
import { PaymentInformation } from '../../models/PaymentInformation';
import { PaymentInformationCreateRequest } from '../../requests/model/PaymentInformationCreateRequest';
import { PaymentInformationUpdateRequest } from '../../requests/model/PaymentInformationUpdateRequest';
import { EscrowService } from './EscrowService';
import { ItemPriceService } from './ItemPriceService';


export class PaymentInformationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ItemPriceService) public itemPriceService: ItemPriceService,
        @inject(Types.Service) @named(Targets.Service.model.EscrowService) public escrowService: EscrowService,
        @inject(Types.Repository) @named(Targets.Repository.PaymentInformationRepository) public paymentInformationRepo: PaymentInformationRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<PaymentInformation>> {
        return this.paymentInformationRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<PaymentInformation> {
        const paymentInformation = await this.paymentInformationRepo.findOne(id, withRelated);
        if (paymentInformation === null) {
            this.log.warn(`PaymentInformation with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return paymentInformation;
    }

    @validate()
    public async create( @request(PaymentInformationCreateRequest) data: PaymentInformationCreateRequest): Promise<PaymentInformation> {
        const body = JSON.parse(JSON.stringify(data));

        // this.log.debug('body: ', JSON.stringify(body, null, 2));

        if (_.isNil(body.listing_item_id) && _.isNil(body.listing_item_template_id)) {
            throw new ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
        }

        const escrow = body.escrow || {};
        const itemPrice = body.itemPrice || {};
        delete body.escrow;
        delete body.itemPrice;

        const paymentInformation: resources.PaymentInformation = await this.paymentInformationRepo.create(body).then(value => value.toJSON());

        if (!_.isEmpty(escrow)) {
            escrow.payment_information_id = paymentInformation.id;
            await this.escrowService.create(escrow).then(value => value.toJSON());
        }

        if (!_.isEmpty(itemPrice)) {
            itemPrice.payment_information_id = paymentInformation.id;
            await this.itemPriceService.create(itemPrice).then(value => value.toJSON());
        }

        return await this.findOne(paymentInformation.id);

    }

    @validate()
    public async update(id: number, @request(PaymentInformationUpdateRequest) data: PaymentInformationUpdateRequest): Promise<PaymentInformation> {

        const body = JSON.parse(JSON.stringify(data));

        const paymentInformation = await this.findOne(id, false);

        paymentInformation.Type = body.type;

        const updatedPaymentInformation = await this.paymentInformationRepo.update(id, paymentInformation.toJSON());

        if (body.escrow) {
            let relatedEscrow = updatedPaymentInformation.related('Escrow').toJSON();
            await this.escrowService.destroy(relatedEscrow.id);

            relatedEscrow = body.escrow;
            relatedEscrow.payment_information_id = id;
            await this.escrowService.create(relatedEscrow);
        }

        let relatedItemPrice = updatedPaymentInformation.related('ItemPrice').toJSON();
        await this.itemPriceService.destroy(relatedItemPrice.id);

        relatedItemPrice = body.itemPrice;
        relatedItemPrice.payment_information_id = id;
        await this.itemPriceService.create(relatedItemPrice);

        return await this.findOne(id);
    }

    public async destroy(id: number): Promise<void> {
        await this.paymentInformationRepo.destroy(id);
    }

}
