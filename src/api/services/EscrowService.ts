import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MessageException } from '../exceptions/MessageException';
import { EscrowRepository } from '../repositories/EscrowRepository';
import { Escrow } from '../models/Escrow';
import { EscrowCreateRequest } from '../requests/EscrowCreateRequest';
import { EscrowUpdateRequest } from '../requests/EscrowUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';
import { ListingItemTemplateRepository } from '../repositories/ListingItemTemplateRepository';
import { PaymentInformationRepository } from '../repositories/PaymentInformationRepository';
import { EscrowRatioService } from '../services/EscrowRatioService';


export class EscrowService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.EscrowRatioService) private escrowratioService: EscrowRatioService,
        @inject(Types.Repository) @named(Targets.Repository.EscrowRepository) public escrowRepo: EscrowRepository,
        @inject(Types.Repository) @named(Targets.Repository.ListingItemTemplateRepository) public listingItemTemplateRepo: ListingItemTemplateRepository,
        @inject(Types.Repository) @named(Targets.Repository.PaymentInformationRepository) private paymentInfoRepo: PaymentInformationRepository,
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

    public async createCheckByListingItem(body: any): Promise<Escrow> {
        // check listingItem by listingItemTemplateId
        const listingItemTemplateId = body.listingItemTemplateId;
        const listingItemTemplate = await this.listingItemTemplateRepo.findOne(listingItemTemplateId);
        if (listingItemTemplate.ListingItem.length === 0) {
            // creates an Escrow related to PaymentInformation related to ListingItemTemplate
            const paymentInformation = await this.paymentInfoRepo.findOneByListingItemTemplateId(listingItemTemplateId);
            if (paymentInformation === null) {
                this.log.warn(`PaymentInformation with the listing_item_template_id=${listingItemTemplateId} was not found!`);
                throw new MessageException(`PaymentInformation with the listing_item_template_id=${listingItemTemplateId} was not found!`);
            }
            body.payment_information_id = paymentInformation.Id;
        } else {
            this.log.warn(`Escrow cannot be created becuase Listing
            Item has allready been posted with this is listing-item-template-id ${listingItemTemplateId}`);
            throw new MessageException(`Escrow cannot be created becuase Listing
            Item has allready been posted with this is listing-item-template-id ${listingItemTemplateId}`);
        }
        delete body.listingItemTemplateId;
        return this.create(body);
    }

    @validate()
    public async create( @request(EscrowCreateRequest) body: any): Promise<Escrow> {

        const escrowRatio = body.ratio;
        delete body.ratio;

        // If the request body was valid we will create the escrow
        const escrow = await this.escrowRepo.create(body);

        // then create escrowratio
        escrowRatio.escrow_id = escrow.Id;
        await this.escrowratioService.create(escrowRatio);

        // finally find and return the created escrow
        const newEscrow = await this.findOne(escrow.Id);
        return newEscrow;
    }

    @validate()
    public async update(id: number, @request(EscrowUpdateRequest) body: any): Promise<Escrow> {

        // find the existing one without related
        const escrow = await this.findOne(id, false);

        // set new values
        escrow.Type = body.type;

        // update escrow record
        const updatedEscrow = await this.escrowRepo.update(id, escrow.toJSON());

        // find related escrowratio
        let relatedRatio = updatedEscrow.related('Ratio').toJSON();

        // delete it
        await this.escrowratioService.destroy(relatedRatio.id);

        // and create new related data
        relatedRatio = body.ratio;
        relatedRatio.escrow_id = id;
        await this.escrowratioService.create(relatedRatio);

        // finally find and return the updated escrow
        const newEscrow = await this.findOne(id);
        return newEscrow;
    }

    public async destroy(id: number): Promise<void> {
        await this.escrowRepo.destroy(id);
    }

}
