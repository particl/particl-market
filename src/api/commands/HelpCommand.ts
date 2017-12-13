import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { RpcRequest } from '../requests/RpcRequest';
import {RpcCommand} from './RpcCommand';

export class HelpCommand implements RpcCommand<string> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'help';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<string> {
        return  'available commands: \n' +
        'createprofile \n' +
        'updateprofile \n' +
        'getprofile \n' +
        'createaddress \n' +
        'updateaddress \n' +
        'finditems \n' +
        'getitem \n' +
        'findownitems \n' +
        'createlistingitemtemplate \n' +
        'getlistingitemtemplate \n' +
        'searchlistingitemtemplate \n' +
        'createiteminformation \n' +
        'updateiteminformation \n' +
        'createcategory \n' +
        'updatecategory \n' +
        'removecategory \n' +
        'getcategories \n' +
        'getcategory \n' +
        'findcategory \n' +
        'addfavorite \n' +
        'removefavorite \n' +
        'updatepaymentinformation \n' +
        'createescrow \n' +
        'updateescrow \n' +
        'destroyescrow \n' +
        'addshippingdestination \n' +
        'removeshippingdestination \n' +
        'updateitemlocation \n' +
        'removeitemlocation \n' +
        'cleandb \n' +
        'adddata \n' +
        'generatedata \n';
    }

    public help(): string {
        return 'HelpCommand: TODO: Fill in help string.';
    }
}
