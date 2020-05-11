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
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { SmsgMessageService } from '../../services/model/SmsgMessageService';
import { ActionDirection } from '../../enums/ActionDirection';

export class SmsgRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {
    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) private smsgMessageService: SmsgMessageService
    ) {
        super(Commands.SMSG_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: msgid
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {

        await this.smsgMessageService.findOneByMsgId(data.params[0], ActionDirection.OUTGOING)
            .then(value => {
                const smsgMessage: resources.SmsgMessage = value.toJSON();
                this.smsgMessageService.destroy(smsgMessage.id);
            })
            .catch(reason => {
                this.log.debug('OUTGOING SMSG with msgid not found');
            });

        await this.smsgMessageService.findOneByMsgId(data.params[0], ActionDirection.INCOMING)
            .then(value => {
                const smsgMessage: resources.SmsgMessage = value.toJSON();
                this.smsgMessageService.destroy(smsgMessage.id);
            })
            .catch(reason => {
                this.log.debug('INCOMING SMSG with msgid not found');
            });
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

        // make sure an SmsgMessage with the msgid exists
        const smsgMessage: resources.SmsgMessage = await this.smsgMessageService.findOneByMsgId(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('SmsgMessage');
            });

        return data;
    }

    public usage(): string {
        return this.getName() + ' <msgid> ';
    }

    public help(): string {
        return this.usage() + '- ' + this.description() + ' \n'
            + '    <msgid>           -  The msgid of the SmsgMessage we want to destroy. \n';
    }

    public description(): string {
        return 'Destroy a SmsgMessage.';
    }

    public example(): string {
        return 'smsg ' + this.getName() + ' 000000005d699e34c2d6cb37f087f41170ce6e776e7052f15bf5ff14';
    }
}
