import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemTemplatePostRequest } from '../../requests/ListingItemTemplatePostRequest';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { ListingItemActionService } from '../../services/ListingItemActionService';

export class ListingItemTemplatePostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemActionService) public listingItemActionService: ListingItemActionService
    ) {
        super(Commands.TEMPLATE_POST);
        this.log = new Logger(__filename);
    }

    /**
     * posts a ListingItem to the network based on ListingItemTemplate
     *
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: marketId, may be optional
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        // TODO: wheres the validation?!?
        // TODO: if the template doesn't have all the required data, throw an exception

        // TODO: check escrow

        const response = await this.listingItemActionService.post({
            listingItemTemplateId: data.params[0],
            marketId: data.params[1] || undefined
        } as ListingItemTemplatePostRequest);

        this.log.debug('ListingItemTemplatePostCommand.post, response: ', response);
        return response;
    }

    public usage(): string {
        return this.getName() + ' <listingTemplateId> <marketId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - Numeric - The ID of the listing item template that we \n'
            + '                                     want to post. \n'
            + '    <marketId>                    - Numeric - The ID of the markte id. ';
    }

    public description(): string {
        return 'Post listing item by listingTemplateId and marketId.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1 1';
    }
}
