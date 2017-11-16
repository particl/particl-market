import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemInformationService } from '../ItemInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemInformation } from '../../models/ItemInformation';

export class RpcItemInformationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) private itemInformationService: ItemInformationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async findAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemInformation>> {
        return this.itemInformationService.findAll();
    }

    @validate()
    public async findOne( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.itemInformationService.findOne(data.params[0]);
    }

    @validate()
    public async create( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.itemInformationService.create({
            title: data.params[0],
            shortDescription: data.params[1],
            longDescription: data.params[2],
            itemCategory: {
                key: data.params[3]
            }
        });
    }


    // @validate()
    // public async rpcUpdate( @request(RpcRequest) data: any): Promise<ItemInformation> {
    //     return this.update(data.params[0], {
    //         title: 'item title1 UPDATED',
    //         shortDescription: 'item short desc1 UPDATED',
    //         longDescription: 'item long desc1 UPDATED',
    //         itemCategory: {
    //             key: 'cat_TESTROOT'
    //         },
    //         itemLocation: {
    //             region: Country.FINLAND,
    //             address: 'asdf, UPDATED',
    //             locationMarker: {
    //                 markerTitle: 'Helsinki UPDATED',
    //                 markerText: 'Helsinki UPDATED',
    //                 lat: 3.234,
    //                 lng: 23.4
    //             }
    //         },
    //         shippingDestinations: [{
    //             country: Country.UNITED_KINGDOM,
    //             shippingAvailability: ShippingAvailability.SHIPS
    //         }],
    //         itemImages: [{
    //             hash: 'imagehash1',
    //             data: {
    //                 dataId: 'dataid1',
    //                 protocol: ImageDataProtocolType.IPFS,
    //                 encoding: null,
    //                 data: null
    //             }
    //         }]
    //     });
    // }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.itemInformationService.destroy(data.params[0]);
    }
}
