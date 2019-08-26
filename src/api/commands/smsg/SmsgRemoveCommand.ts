// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { SmsgMessageService } from '../../services/model/SmsgMessageService';

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
     *  [0]: smsgMessage: resources.SmsgMessage
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        const smsgMessage: resources.SmsgMessage = data.params[0];
        return this.smsgMessageService.destroy(smsgMessage.id);
    }

    /**
     * data.params[]:
     *  [0]: id
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('smsgId');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('smsgId', 'number');
        }

        // make sure SmsgMessage with the id exists
        data.params[0] = await this.smsgMessageService.findOne(data.params[0])
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new ModelNotFoundException('SmsgMessage');
            });

        return data;
    }

    public usage(): string {
        return this.getName() + ' <smsgId> ';
    }

    public help(): string {
        return this.usage() + '- ' + this.description() + ' \n'
            + '    <smsgId>              -  The id of the SmsgMessage we want to destroy. \n';
    }

    public description(): string {
        return 'Destroy a SmsgMessage.';
    }

    public example(): string {
        return 'smsg ' + this.getName() + ' 2';
    }
}
