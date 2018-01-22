import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';

export class ListingItemTemplateDestroyCommand implements RpcCommandInterface<void> {

    public log: LoggerType;
    public name: string;
    public helpStr: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'removelistingitemtemplate';
        this.helpStr = 'removelistingitemtemplate <listingTemplateId>\n'
            + '    <listingTemplateId>    -    Numeric - The ID of the listing item template that we\n'
            + '                                 want to destroy.';
    }

    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<void> {
        return this.listingItemTemplateService.destroy(data.params[0]);
    }

    public help(): string {
        return this.helpStr;
    }
}
