import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { TestDataCreateRequest } from '../../requests/TestDataCreateRequest';
import { CommandEnumType } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class AdminCommand extends BaseCommand implements RpcCommandInterface<any> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(new CommandEnumType().ADMIN);
        this.log = new Logger(__filename);
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<any> {

        commands.values
        switch (data.params.shift()) {
            case 6:
                text = "Today is Saturday";
                break;
            case 0:
                text = "Today is Sunday";
                break;
            default:
                text = "Looking forward to the Weekend";
        }
        const nextCommand = ;

        const withRelated = data.params[2] ? data.params[2] : true;
        return await this.testDataService.create({
            model: data.params[0],
            data: JSON.parse(data.params[1]),
            withRelated
        } as TestDataCreateRequest);
    }

    public help(): string {
        return '(data)';
    }

    public example(): string {
        return null;
    }

}
