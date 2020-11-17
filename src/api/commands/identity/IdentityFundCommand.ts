// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as math from 'mathjs';
import { inject, named } from 'inversify';
import { request, validate } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { ProfileService } from '../../services/model/ProfileService';
import { IdentityService } from '../../services/model/IdentityService';
import {
    BooleanValidationRule,
    CommandParamValidationRules, EnumValidationRule,
    IdValidationRule,
    NumberValidationRule,
    ParamValidationRule,
    PriceValidationRule,
    StringValidationRule
} from '../CommandParamValidation';
import { CoreRpcService } from '../../services/CoreRpcService';
import { CryptoAddress, OutputType } from 'omp-lib/dist/interfaces/crypto';
import { RpcBlindSendToOutput } from 'omp-lib/dist/interfaces/rpc';
import { IdentityType } from '../../enums/IdentityType';
import { MessageException } from '../../exceptions/MessageException';


export interface FundResponse {
    txid?: string;
    fee?: number;
    bytes?: number;
    need_hwdevice?: boolean;
    outputs_fee?: any;
}

export class IdentityFundCommand extends BaseCommand implements RpcCommandInterface<FundResponse> {

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.IDENTITY_FUND);
        this.log = new Logger(__filename);

        this.debug = true;
    }

    /**
     * data.params[]:
     *  [0]: identity: resources.Identity
     *  [1]: walletFrom: string
     *  [2]: amount: number
     *  [3]: outputCount: number, optional, default: 10
     *  [3]: fromType: OutputType, optional, default: OutputType.PART
     *  [3]: estimateFee: boolean, optional, default: false
     */
    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('identityId', true, this.identityService),
                new StringValidationRule('walletFrom', true),
                new PriceValidationRule('amount', true),
                new NumberValidationRule('outputCount', false, 10),
                new EnumValidationRule('fromType', false, 'OutputType',
                    [OutputType.ANON, OutputType.BLIND, OutputType.PART] as string[], OutputType.PART),
                new BooleanValidationRule('estimateFee', false, false)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<FundResponse> {
        const identity: resources.Identity = data.params[0];
        const walletFrom: string = data.params[1];
        const amount: number = data.params[2];
        const outputCount: number = Math.floor(data.params[3]);
        const fromType: OutputType = data.params[4];
        const estimateFee: boolean = data.params[5];

        const outputs: RpcBlindSendToOutput[] = [];
        const singleTxAmount: number = +math.format(math.divide(amount, outputCount), {precision: 8});

        for (let i = 0; i < outputCount; i++) {
            const addr: CryptoAddress = await this.coreRpcService.getNewStealthAddress(identity.wallet);
            const output = {
                address: addr.address,
                amount: singleTxAmount
            } as RpcBlindSendToOutput;

            outputs.push(output);
        }

        const result = await this.coreRpcService.sendTypeTo(walletFrom, fromType, OutputType.ANON, outputs, estimateFee);
        if (estimateFee) {
            return result;
        } else {
            return {
                txid: result
            };
        }
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const identity: resources.Identity = data.params[0];
        const walletFrom: string = data.params[1];

        if (identity.type !== IdentityType.MARKET) {
            throw new MessageException('Invalid IdentityType.');
        }

        const walletExist = await this.coreRpcService.walletExists(walletFrom);
        if (!walletExist) {
            throw new MessageException('Wallet with the name doesn\'t exist.');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <identityId> <walletFrom> <amount> [outputCount] [typeIn] [estimateFee]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <identityId>             - number, Id of the Identity which wallet is to be funded. \n'
            + '    <walletFrom>             - string, Wallet used for funding. \n'
            + '    <amount>                 - number, Amount to be funded. \n'
            + '    <outputCount>            - number, [optional] Amount of utxos to create, default: 10. \n'
            + '    <typeIn>                 - OutputType, [optional] Output type to send funds from, default: PART.'
            + '    <estimateFee>            - boolean, [optional] Estimate the fee, default: false. \n';
    }

    public description(): string {
        return 'Command for funding a Market Identity wallet.';
    }

    public example(): string {
        return 'identity ' + this.getName() + ' 1 profiles/DEFAULT/particl-market 10 10';
    }

}
