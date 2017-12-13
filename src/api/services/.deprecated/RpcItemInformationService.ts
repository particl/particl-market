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
     * @returns {Promise<ItemInformation>}
     */
    @validate()
    public async findOne( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.itemInformationService.findOne(data.params[0]);
    }

    /**
     * data.params[]:
     *  [0]: listing template id
     *  [1]: title
     *  [2]: short-description
     *  [3]: long-description
     *  [4]: category
     *
     * @param data
     * @returns {Promise<ItemInformation>}
     */
    @validate()
    public async create( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.itemInformationService.create({
            listing_item_template_id: data.params[0],
            title: data.params[1],
            shortDescription: data.params[2],
            longDescription: data.params[3],
            itemCategory: {
                key: data.params[4]
            }
        });
    }

    /**
     * data.params[]:
     *  [0]: listing template id
     *  [1]: title
     *  [2]: short-description
     *  [3]: long-description
     *  [4]: category
     *
     * @param data
     * @returns {Promise<ItemInformation>}
     */
    @validate()
    public async update( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.itemInformationService.updateWithCheckListingTemplate({
            listing_item_template_id: data.params[0],
            title: data.params[1],
            shortDescription: data.params[2],
            longDescription: data.params[3],
            itemCategory: {
                key: data.params[4]
            }
        });
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.itemInformationService.destroy(data.params[0]);
    }
}
