import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { PaymentInformationService } from '../PaymentInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { PaymentInformation } from '../../models/PaymentInformation';


export class RpcPaymentInformationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) private paymentInformationService: PaymentInformationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async findAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<PaymentInformation>> {
        return this.paymentInformationService.findAll();
    }

    /**
     * data.params[]:
     *  [0]: id to fetch
     *
     * @param data
     * @returns {Promise<PaymentInformation>}
     */
    @validate()
    public async findOne( @request(RpcRequest) data: any): Promise<PaymentInformation> {
        return this.paymentInformationService.findOne(data.params[0]);
    }

    /**
     * data.params[]:
     *
     * @param data
     * @returns {Promise<PaymentInformation>}
     */
    // @validate()
    // public async create( @request(RpcRequest) data: any): Promise<PaymentInformation> {
    //     return this.paymentInformationService.create({
    //         type: data.params[0],
    //         escrow: {
    //             type: data.params[1],
    //             ratio: {
    //                 buyer: data.params[2],
    //                 seller: data.params[3]
    //             }
    //         },
    //         itemPrice: {
    //             currency: data.params[4],
    //             basePrice: data.params[5],
    //             shippingPrice: {
    //                 domestic: data.params[6],
    //                 international: data.params[7]
    //             },
    //             address: {
    //                 type: data.params[8],
    //                 address: data.params[9]
    //             }
    //         }
    //     });
    // }

    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     *  [1]: payment type
     *  [2]: currency
     *  [3]: base price
     *  [4]: domestic shipping price
     *  [5]: international shipping price
     *  [6]: payment address
     *
     * @param data
     * @returns {Promise<PaymentInformation>}
     */
    @validate()
    public async update( @request(RpcRequest) data: any): Promise<PaymentInformation> {
        return this.paymentInformationService.update(data.params[0], {
            type: data.params[1],
            // escrow: {
            //     type: data.params[2],
            //     ratio: {
            //         buyer: data.params[3],
            //         seller: data.params[4]
            //     }
            // },
            itemPrice: {
                currency: data.params[2],
                basePrice: data.params[3],
                shippingPrice: {
                    domestic: data.params[4],
                    international: data.params[5]
                },
                address: {
                    type: 'address-type',
                    address: data.params[6]
                }
            }
        });
    }

    @validate()
    public async destroy( @request(RpcRequest) data: any): Promise<void> {
        return this.paymentInformationService.destroy(data.params[0]);
    }
}
