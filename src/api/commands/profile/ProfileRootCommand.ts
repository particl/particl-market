import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProfileCreateCommand } from './ProfileCreateCommand';
import { ProfileDestroyCommand } from './ProfileDestroyCommand';
import { ProfileGetCommand } from './ProfileGetCommand';
import { ProfileUpdateCommand } from './ProfileUpdateCommand';
import { ProfileListCommand } from './ProfileListCommand';

import { FavoriteRootCommand } from './../favorite/FavoriteRootCommand';
// import { AddressRootCommand } from './address/AddressRootCommand';

import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';

export class ProfileRootCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Command) @named(Targets.Command.profile.ProfileCreateCommand) private profileCreateCommand: ProfileCreateCommand,
        @inject(Types.Command) @named(Targets.Command.profile.ProfileDestroyCommand) private profileDestroyCommand: ProfileDestroyCommand,
        @inject(Types.Command) @named(Targets.Command.profile.ProfileGetCommand) private profileGetCommand: ProfileGetCommand,
        @inject(Types.Command) @named(Targets.Command.profile.ProfileUpdateCommand) private profileUpdateCommand: ProfileUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.profile.ProfileListCommand) private profileListCommand: ProfileListCommand,

        @inject(Types.Command) @named(Targets.Command.favorite.FavoriteRootCommand) private favoriteRootCommand: FavoriteRootCommand,
        // @inject(Types.Command) @named(Targets.Command.address.AddressRootCommand) private addressRootCommand: AddressRootCommand,

        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.PROFILE_ROOT);
        this.log = new Logger(__filename);
    }

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        return await this.executeNext(data, rpcCommandFactory);
    }

    public help(): string {
        return this.getName() + ' (get|add|update|remove|address|favorite) ';
    }

    public description(): string {
        return 'Commands for managing Profile.';
    }
}
