import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { RpcRequest } from '../requests/RpcRequest';
import { RpcCommandInterface } from './RpcCommandInterface';
import { BaseCommand } from './BaseCommand';
import { CommandEnumType } from './CommandEnumType';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';

export class HelpCommand extends BaseCommand implements RpcCommandInterface<string> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.RpcCommandFactory) private rpcCommandFactory: RpcCommandFactory
    ) {
        super(new CommandEnumType().HELP, rpcCommandFactory);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]: [command]
     *
     * @param data
     * @returns {Promise<Escrow>}
     */
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
        return '[command]';
    }

    public example(): string {
        return null;
    }

}
