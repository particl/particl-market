/**
 * MakeRpcCommandCommand
 * -------------------------------------
 *
 */
import { AbstractMakeCommand } from './lib/AbstractMakeCommand';


export class MakeRpcCommandCommand extends AbstractMakeCommand {

    public static command = 'make:rpccommand';
    public static description = 'Generate new rpc command';

    public type = 'RpcCommand';
    public suffix = 'RpcCommand';
    public template = 'rpccommand.hbs';
    public target = 'api/rpccommands';
    public updateTargets = true;

    public async run(): Promise<void> {
        console.log('hello');
        await super.run();
    }
}
