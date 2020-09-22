// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { request, validate } from '../../../core/api/Validate';
import { Core, Targets, Types } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ActionDirection } from '../../enums/ActionDirection';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { SmsgService } from '../../services/SmsgService';
import { SmsgMessageService } from '../../services/model/SmsgMessageService';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';
import { IdentityService } from '../../services/model/IdentityService';
import { CommandParamValidationRules, IdValidationRule, ParamValidationRule, StringValidationRule } from '../CommandParamValidation';
import {BidCancelRequest} from '../../requests/action/BidCancelRequest';

export class SmsgResendCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) private smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) private smsgService: SmsgService
    ) {
        super(Commands.SMSG_RESEND);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new StringValidationRule('msgid', true),
                new IdValidationRule('identityId', true, this.identityService)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: smsgMessage: resources.SmsgMessage
     *  [1]: identity: resources.Identity
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {
        const smsgMessage: resources.SmsgMessage = data.params[0];
        const identity: resources.Identity = data.params[1];

        const sendParams = {
            wallet: identity.wallet,
            fromAddress: smsgMessage.from,
            toAddress: smsgMessage.to,
            daysRetention: smsgMessage.daysretention,
            estimateFee: false,
            anonFee: true
        } as SmsgSendParams;

        const marketplaceMessage: MarketplaceMessage = JSON.parse(smsgMessage.text);
        marketplaceMessage.action.objects = marketplaceMessage.action.objects !== undefined ? marketplaceMessage.action.objects : [] as KVS[];
        marketplaceMessage.action.objects.push({
            key: ActionMessageObjects.RESENT_MSGID,
            value: smsgMessage.msgid
        } as KVS);

        this.log.debug('RESENDING: ', JSON.stringify(marketplaceMessage, null, 2));
        const smsgSendResponse: SmsgSendResponse = await this.smsgService.sendMessage(marketplaceMessage, sendParams);
        await this.smsgMessageService.updateStatus(smsgMessage.id, SmsgMessageStatus.RESENT);

        return smsgSendResponse;
    }

    /**
     * data.params[]:
     *  [0]: msgid
     *  [1]: identityId
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        // make sure an outgoing SmsgMessage with the msgid exists
        const smsgMessage: resources.SmsgMessage = await this.smsgMessageService.findOneByMsgIdAndDirection(data.params[0],  ActionDirection.OUTGOING)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('SmsgMessage');
            });

        // then find the identity which was used to send the message
        // smsgMessage.from === market.publishAddress -> doesn't work here
        // for MPA_LISTING_ADD we could find the seller address from the message, for others that's not possible.
        // getting the identity using the market.publishAddress isn't possible since multiple profiles could have the same market.
        // TODO: we could save the identity used to send the message and use that,
        // but too lazy to add that now. -> add identityId param

        data.params[0] = smsgMessage;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <msgid> <identityId>';
    }

    public help(): string {
        return this.usage() + '- ' + this.description() + ' \n'
            + '    <msgid>              -  The msgid of the SmsgMessage we want to resend. \n'
            + '    <identityId>         -  The identityId used to resend the message. \n';
    }

    public description(): string {
        return 'Resend a SmsgMessage.';
    }

    public example(): string {
        return 'smsg ' + this.getName() + ' 000000005d699e34c2d6cb37f087f41170ce6e776e7052f15bf5ff14 1';
    }
}
