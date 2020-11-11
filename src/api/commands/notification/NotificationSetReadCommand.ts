// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { BooleanValidationRule, CommandParamValidationRules, IdValidationRule, ParamValidationRule } from '../CommandParamValidation';
import { NotificationService } from '../../services/model/NotificationService';
import { Notification } from '../../models/Notification';


export class NotificationSetReadCommand extends BaseCommand implements RpcCommandInterface<Notification> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.NotificationService) private notificationService: NotificationService
    ) {
        super(Commands.NOTIFICATION_SETREAD);
        this.log = new Logger(__filename);
    }

    /**
     * params[]:
     *  [0]: notification: resources.Notification
     *
     */
    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('notificationId', true, this.notificationService),
                new BooleanValidationRule('read', false, true)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: notification: resources.Notification
     *
     * @param data
     * @returns {Promise<Notification>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Notification> {
        const notification: resources.Notification = data.params[0];
        const read: boolean = data.params[1];

        return await this.notificationService.setRead(notification.id, read);
    }

    /**
     * data.params[]:
     *  [0]: notification: resources.Notification
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);
        return data;
    }

    public usage(): string {
        return this.getName() + ' <notificationId> [read] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <notificationId>             - number, the Id of the Notification which read state we want to set. '
            + '    <read>                       - [optional] boolean, the state we want to set, default: true. ';
    }

    public description(): string {
        return 'Set Notifications read state.';
    }

    public example(): string {
        return 'image ' + this.getName() + ' 1 ';
    }
}
