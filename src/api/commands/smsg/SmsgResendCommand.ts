// Copyright (c) 2017-2019, The Particl Market developers
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
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
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

export class SmsgResendCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {
    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) private smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) private smsgService: SmsgService
    ) {
        super(Commands.SMSG_RESEND);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: smsgMessage: resources.SmsgMessage
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {
        const smsgMessage: resources.SmsgMessage = data.params[0];

        const fromAddress = smsgMessage.from;
        const toAddress = smsgMessage.to;
        const daysRetention: number = smsgMessage.daysretention;
        const estimateFee = false;

        const sendParams = new SmsgSendParams(fromAddress, toAddress, false, daysRetention, estimateFee);

        const marketplaceMessage: MarketplaceMessage = JSON.parse(smsgMessage.text);
        marketplaceMessage.action.objects = marketplaceMessage.action.objects !== undefined ? marketplaceMessage.action.objects : [] as KVS[];
        marketplaceMessage.action.objects.push({
            key: ActionMessageObjects.RESENT_MSGID,
            value: smsgMessage.msgid
        } as KVS);

        const smsgSendResponse: SmsgSendResponse = await this.smsgService.sendMessage(marketplaceMessage, sendParams);
        await this.smsgMessageService.updateSmsgMessageStatus(smsgMessage.id, SmsgMessageStatus.RESENT);

        return smsgSendResponse;
    }

    /**
     * data.params[]:
     *  [0]: msgid
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('msgid');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('msgid', 'string');
        }

        // make sure an outgoing SmsgMessage with the msgid exists
        const smsgMessage: resources.SmsgMessage = await this.smsgMessageService.findOneByMsgId(data.params[0],  ActionDirection.OUTGOING)
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new ModelNotFoundException('SmsgMessage');
            });
        data.params[0] = smsgMessage;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <msgid> ';
    }

    public help(): string {
        return this.usage() + '- ' + this.description() + ' \n'
            + '    <msgid>              -  The msgid of the SmsgMessage we want to resend. \n';
    }

    public description(): string {
        return 'Resend a SmsgMessage.';
    }

    public example(): string {
        return 'smsg ' + this.getName() + ' 000000005d699e34c2d6cb37f087f41170ce6e776e7052f15bf5ff14';
    }
}
