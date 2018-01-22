import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemInformationService } from '../../services/ItemInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemInformationCreateRequest } from '../../requests/ItemInformationCreateRequest';
import { ItemInformation } from '../../models/ItemInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import {CommandEnumType, Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';

export class ItemInformationCreateCommand extends BaseCommand implements RpcCommandInterface<ItemInformation> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) private itemInformationService: ItemInformationService
    ) {
        super(Commands.ITEMINFORMATION_ADD);
        this.log = new Logger(__filename);
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
    public async execute( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.itemInformationService.create({
            listing_item_template_id: data.params[0],
            title: data.params[1],
            shortDescription: data.params[2],
            longDescription: data.params[3],
            itemCategory: {
                key: data.params[4]
            }
        } as ItemInformationCreateRequest);
    }

    public help(): string {
        return 'createiteminformation <listingTemplateId> <title> <shortDescription> <longDescription> <category>\n'
            + '    <listingTemplateId>             - Numeric - The ID of the listing item template we\n'
            + '                                       want to associate the created item information\n'
            + '                                       with.\n'
            + '    <title>                         - String - The title of the created item\n'
            + '                                       information.\n'
            + '    <shortDescription>              - String - A short description of the created\n'
            + '                                       item information.\n'
            + '    <longDescription>               - String - A long description of the created\n'
            + '                                       item information.\n'
            + '    <categoryKey>                   - String - The key that identifies the item\n'
            + '                                       category we want to associate the created\n'
            + '                                       item information with.';
    }

    public example(): any {
        return null;
    }

}
