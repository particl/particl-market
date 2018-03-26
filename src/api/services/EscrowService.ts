import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MessageException } from '../exceptions/MessageException';

import { Escrow } from '../models/Escrow';
import { EscrowRepository } from '../repositories/EscrowRepository';

import { EscrowCreateRequest } from '../requests/EscrowCreateRequest';
import { EscrowUpdateRequest } from '../requests/EscrowUpdateRequest';
import { EscrowReleaseRequest } from '../requests/EscrowReleaseRequest';
import { EscrowRefundRequest } from '../requests/EscrowRefundRequest';
import { EscrowLockRequest } from '../requests/EscrowLockRequest';

import { SmsgSendResponse } from '../responses/SmsgSendResponse';

import { MarketplaceMessage } from '../messages/MarketplaceMessage';

import { EscrowFactory } from '../factories/EscrowFactory';

import { ListingItemTemplateService } from './ListingItemTemplateService';
import { PaymentInformationService } from './PaymentInformationService';
import { EscrowRatioService } from '../services/EscrowRatioService';
import { AddressService } from '../services/AddressService';
import { SmsgService } from '../services/SmsgService';

export class EscrowService {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.EscrowFactory) public escrowFactory: EscrowFactory,
        @inject(Types.Repository) @named(Targets.Repository.EscrowRepository) public escrowRepo: EscrowRepository,
        // @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        // @inject(Types.Service) @named(Targets.Service.PaymentInformationService) public paymentInformationService: PaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.EscrowRatioService) public escrowRatioService: EscrowRatioService,
        @inject(Types.Service) @named(Targets.Service.AddressService) public addressService: AddressService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Escrow>> {
        return this.escrowRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Escrow> {
        const escrow = await this.escrowRepo.findOne(id, withRelated);
        if (escrow === null) {
            this.log.warn(`Escrow with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return escrow;
    }

    @validate()
    public async create( @request(EscrowCreateRequest) data: EscrowCreateRequest): Promise<Escrow> {

        const body = JSON.parse(JSON.stringify(data));

        const escrowRatio = body.ratio;
        delete body.ratio;

        // If the request body was valid we will create the escrow
        const escrow = await this.escrowRepo.create(body);

        // create related models, escrowRatio
        if (!_.isEmpty(escrowRatio)) {
            escrowRatio.escrow_id = escrow.Id;
            await this.escrowRatioService.create(escrowRatio);
        }

        // finally find and return the created escrow
        return await this.findOne(escrow.Id);
    }

    @validate()
    public async update(id: number, @request(EscrowUpdateRequest) data: EscrowUpdateRequest): Promise<Escrow> {

        const body = JSON.parse(JSON.stringify(data));

        // find the existing one without related
        const escrow = await this.findOne(id, false);

        // set new values
        escrow.Type = body.type;

        // update escrow record
        const updatedEscrow = await this.escrowRepo.update(id, escrow.toJSON());

        // find related escrowratio
        let relatedRatio = updatedEscrow.related('Ratio').toJSON();

        // delete it
        await this.escrowRatioService.destroy(relatedRatio.id);

        // and create new related data
        relatedRatio = body.ratio;
        relatedRatio.escrow_id = id;
        await this.escrowRatioService.create(relatedRatio);

        // finally find and return the updated escrow
        const newEscrow = await this.findOne(id);
        return newEscrow;
    }

    public async destroy(id: number): Promise<void> {
        await this.escrowRepo.destroy(id);
    }

    @validate()
    public async lock(@request(EscrowLockRequest) escrowRequest: EscrowLockRequest, escrow: Escrow): Promise<SmsgSendResponse> {

        // NOTE: We need to change as any from here to may be Escrow like that, currently I added it as any here because here
        // resources.Escrow module not able to include here.

        const escrowModel: any = escrow;

        // fetch the address
        const addressModel = await this.addressService.findOne(escrowRequest.addressId, false);
        const address = addressModel.toJSON();

        if (_.isEmpty(escrowModel) || _.isEmpty(address)) {
            throw new MessageException('Escrow or Address not found!');
        }

        // use escrowfactory to generate the lock message
        const escrowActionMessage = await this.escrowFactory.getMessage(escrowRequest, escrowModel, address);
        const marketPlaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: escrowActionMessage
        } as MarketplaceMessage;

        // TODO: add profile and market addresses
        return await this.smsgService.smsgSend('', '', marketPlaceMessage);
    }

    @validate()
    public async refund(@request(EscrowRefundRequest) escrowRequest: EscrowRefundRequest, escrow: Escrow): Promise<SmsgSendResponse> {

        // NOTE: We need to change as any from here to may be Escrow like that, currently I added it as any here because here
        // resources.Escrow module not able to include here.

        const escrowModel: any = escrow;

        // use escrowfactory to generate the refund message
        const escrowActionMessage = await this.escrowFactory.getMessage(escrowRequest, escrowModel);
        const marketPlaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: escrowActionMessage
        } as MarketplaceMessage;

        // TODO: add profile and market addresses
        return await this.smsgService.smsgSend('', '', marketPlaceMessage);
    }

    @validate()
    public async release(@request(EscrowReleaseRequest) escrowRequest: EscrowReleaseRequest, escrow: Escrow): Promise<SmsgSendResponse> {

        // NOTE: We need to change as any from here to may be Escrow like that, currently I added it as any here because here
        // resources.Escrow module not able to include here.

        const escrowModel: any = escrow;

        // use escrowfactory to generate the release message
        const escrowActionMessage = await this.escrowFactory.getMessage(escrowRequest, escrowModel);
        const marketPlaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: escrowActionMessage
        } as MarketplaceMessage;

        // TODO: add profile and market addresses
        return await this.smsgService.smsgSend('', '', marketPlaceMessage);
    }

}
