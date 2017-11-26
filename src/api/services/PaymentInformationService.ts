import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { PaymentInformationRepository } from '../repositories/PaymentInformationRepository';
import { PaymentInformation } from '../models/PaymentInformation';
import { PaymentInformationCreateRequest } from '../requests/PaymentInformationCreateRequest';
import { PaymentInformationUpdateRequest } from '../requests/PaymentInformationUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';
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
    public async create( @request(PaymentInformationCreateRequest) data: any): Promise<PaymentInformation> {

        const body = JSON.parse(JSON.stringify(data));

        const escrow = body.escrow;
        const itemPrice = body.itemPrice;

        delete body.escrow;
        delete body.itemPrice;

        // If the request body was valid we will create the paymentInformation
        const paymentInformation = await this.paymentInformationRepo.create(body);

        // then create escrow
        escrow.payment_information_id = paymentInformation.Id;
        await this.escrowService.create(escrow);

        // then create item price
        itemPrice.payment_information_id = paymentInformation.Id;
        await this.itemPriceService.create(itemPrice);

        // finally find and return the created paymentInformation
        const newPaymentInformation = await this.findOne(paymentInformation.Id);
        return newPaymentInformation;
    }

    @validate()
    public async update(id: number, @request(PaymentInformationUpdateRequest) data: any): Promise<PaymentInformation> {

        const body = JSON.parse(JSON.stringify(data));

        // find the existing one without related
        const paymentInformation = await this.findOne(id, false);

        // set new values
        paymentInformation.Type = body.type;

        // update paymentInformation record
        const updatedPaymentInformation = await this.paymentInformationRepo.update(id, paymentInformation.toJSON());

        // find related record and delete it
        let relatedEscrow = updatedPaymentInformation.related('Escrow').toJSON();
        await this.escrowService.destroy(relatedEscrow.id);

        // recreate related data
        relatedEscrow = body.escrow;
        relatedEscrow.payment_information_id = id;
        await this.escrowService.create(relatedEscrow);

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

    // -----------------------------------------------------
    // TODO: used for testing, remove...

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<PaymentInformation>> {
        return this.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<PaymentInformation> {
        return this.findOne(data.params[0]);
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<PaymentInformation> {
        return this.create({
            type: data.params[0],
            escrow: {
                type: data.params[1],
                ratio: {
                    buyer: data.params[2],
                    seller: data.params[3]
                }
            },
            itemPrice: {
                currency: data.params[4],
                basePrice: data.params[5],
                shippingPrice: {
                    domestic: data.params[6],
                    international: data.params[7]
                },
                address: {
                    type: data.params[8],
                    address: data.params[9]
                }
            }
        });
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<PaymentInformation> {
        return this.update(data.params[0], {
            type: data.params[1],
            escrow: {
                type: data.params[2],
                ratio: {
                    buyer: data.params[3],
                    seller: data.params[4]
                }
            },
            itemPrice: {
                currency: data.params[5],
                basePrice: data.params[6],
                shippingPrice: {
                    domestic: data.params[7],
                    international: data.params[8]
                },
                address: {
                    type: data.params[9],
                    address: data.params[10]
                }
            }
        });
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

}
