import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ValidationException } from '../exceptions/ValidationException';
import { MessageException } from '../exceptions/MessageException';
import { PaymentInformationRepository } from '../repositories/PaymentInformationRepository';
import { PaymentInformation } from '../models/PaymentInformation';
import { PaymentInformationCreateRequest } from '../requests/PaymentInformationCreateRequest';
import { PaymentInformationUpdateRequest } from '../requests/PaymentInformationUpdateRequest';
import { EscrowService } from './EscrowService';
import { ItemPriceService } from './ItemPriceService';

export class PaymentInformationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemPriceService) private itemPriceService: ItemPriceService,
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
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

        // ItemInformation needs to be related to either one
        if (body.listing_item_id == null && body.listing_item_template_id == null) {
            throw new ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
        }

        // extract and remove related models from request
        const escrow = body.escrow;
        const itemPrice = body.itemPrice;
        delete body.escrow;
        delete body.itemPrice;

        // If the request body was valid we will create the paymentInformation
        const paymentInformation = await this.paymentInformationRepo.create(body);

        // create related models, escrow
        if (!_.isEmpty(escrow)) {
            escrow.payment_information_id = paymentInformation.Id;
            await this.escrowService.create(escrow);
        }

        // create related models, item price
        if (!_.isEmpty(itemPrice)) {
            itemPrice.payment_information_id = paymentInformation.Id;
            await this.itemPriceService.create(itemPrice);
        }

        // finally find and return the created paymentInformation
        return await this.findOne(paymentInformation.Id);
    }

    public async updateByListingId(@request(PaymentInformationUpdateRequest) body: PaymentInformationUpdateRequest): Promise<PaymentInformation> {
        const paymentInformation = await this.paymentInformationRepo.findOneByListingItemTemplateId(body.listing_item_template_id);
        if (paymentInformation === null) {
            this.log.warn(`PaymentInformation with the listing_item_template_id=${body.listing_item_template_id} was not found!`);
            throw new MessageException(`PaymentInformation with the listing_item_template_id=${body.listing_item_template_id} was not found!`);
        }
        return this.update(paymentInformation.id, body);
    }

    @validate()
    public async update(id: number, @request(PaymentInformationUpdateRequest) data: PaymentInformationUpdateRequest): Promise<PaymentInformation> {

        const body = JSON.parse(JSON.stringify(data));

        // ItemInformation needs to be related to either one
        if (body.listing_item_id == null && body.listing_item_template_id == null) {
            throw new ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
        }

        // find the existing one without related
        const paymentInformation = await this.findOne(id, false);
        // set new values
        paymentInformation.Type = body.type;

        // update paymentInformation record
        const updatedPaymentInformation = await this.paymentInformationRepo.update(id, paymentInformation.toJSON());

        if (body.escrow) {
            // find related record and delete it
            let relatedEscrow = updatedPaymentInformation.related('Escrow').toJSON();
            await this.escrowService.destroy(relatedEscrow.id);

            // recreate related data
            relatedEscrow = body.escrow;
            relatedEscrow.payment_information_id = id;
            await this.escrowService.create(relatedEscrow);
        }
        // find related record and delete it
        let relatedItemPrice = updatedPaymentInformation.related('ItemPrice').toJSON();
        await this.itemPriceService.destroy(relatedItemPrice.id);

        // recreate related data
        relatedItemPrice = body.itemPrice;
        relatedItemPrice.payment_information_id = id;
        await this.itemPriceService.create(relatedItemPrice);

        // finally find and return the updated paymentInformation
        const newPaymentInformation = await this.findOne(id);
        return newPaymentInformation;

    }

    public async destroy(id: number): Promise<void> {
        await this.paymentInformationRepo.destroy(id);
    }

}
