// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { Commands } from '../CommandEnumType';
import { CommandParamValidationRules, IdValidationRule, ParamValidationRule } from '../CommandParamValidation';
import { NotificationService } from '../../services/model/NotificationService';


export class NotificationRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.NotificationService) private notificationService: NotificationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.NOTIFICATION_REMOVE);
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
                new IdValidationRule('notificationId', true, this.notificationService)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: notification: resources.Notification
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        const notification: resources.Notification = data.params[0];
        return this.notificationService.destroy(notification.id);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);
        return data;
    }

    public usage(): string {
        return this.getName() + ' <notificationId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <notificationId>                 - The Id of the Notification we want to remove. ';
    }

    public description(): string {
        return 'Remove a Notification.';
    }

    public example(): string {
        return 'notification ' + this.getName() + ' 1 ';
    }
}
