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

    /**
     * data.params[]:
     *  [0]: id
     *
     * when data.params[0] is number then findById, else findOneByKey
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async findOne( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.itemInformationService.findOne(data.params[0]);
    }

    /**
     * data.params[]:
     *  [0]: title
     *  [1]: short-description
     *  [2]: long-description
     *  [3]: category
     *
     * @param data
     * @returns {Promise<Profile>}
     */
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

    /**
     * data.params[]:
     *  [0]: id
     *  [1]: title
     *  [2]: short-description
     *  [3]: long-description
     *  [4]: category
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async update( @request(RpcRequest) data: any): Promise<ItemInformation> {
        /*
        TODO: FIX
         src/api/services/rpc/RpcItemInformationService.ts (74,44): Property 'updateWithCheckListingTemplate'
         does not exist on type 'ItemInformationService'. (2339)

        return this.itemInformationService.updateWithCheckListingTemplate(data.params[0], {
            title: data.params[1],
            shortDescription: data.params[2],
            longDescription: data.params[3],
            itemCategory: {
                key: data.params[4]
            }
        });
        */
        return new ItemInformation();
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.itemInformationService.destroy(data.params[0]);
    }
}
