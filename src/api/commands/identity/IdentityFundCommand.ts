// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { ProfileService } from '../../services/model/ProfileService';
import { IdentityService } from '../../services/model/IdentityService';
import {
    CommandParamValidationRules,
    IdValidationRule,
    NumberValidationRule,
    ParamValidationRule,
    PriceValidationRule,
    StringValidationRule
} from '../CommandParamValidation';

export class IdentityFundCommand extends BaseCommand implements RpcCommandInterface<boolean> {

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.IDENTITY_FUND);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: identity: resources.Identity
     *  [1]: walletFrom: string
     *  [2]: amount: number
     *  [3]: outputCount: number, optional, default: 10
     */
    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('identityId', true, this.identityService),
                new StringValidationRule('walletFrom', true),
                new PriceValidationRule('amount', true),
                new NumberValidationRule('outputCount', false, 10)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<boolean> {


        return true;
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);
        return data;
    }

    public usage(): string {
        return this.getName() + ' <identityId> <walletFrom> <amount> [outputCount]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <identityId>                     - number, Id of the Identity which wallet is to be funded. \n'
            + '    <walletFrom>                     - string, Wallet used for funding. \n'
            + '    <amount>                         - number, Amount to be funded. \n'
            + '    <outputCount>                    - number, [optional] Amount of utxos to create, default 10. \n';
    }

    public description(): string {
        return 'Command for funding a Market wallet.';
    }

    public example(): string {
        return 'identity ' + this.getName() + ' 1 profiles/DEFAULT/particl-market 100 10';
    }

}
