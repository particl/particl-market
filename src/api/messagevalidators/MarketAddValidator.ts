// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ValidationException } from '../exceptions/ValidationException';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { inject, named } from 'inversify';
import { ActionDirection } from '../enums/ActionDirection';
import { Core, Targets, Types } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { CoreRpcService } from '../services/CoreRpcService';
import { MarketService } from '../services/model/MarketService';
import { MPActionExtended } from '../enums/MPActionExtended';
import { MarketAddMessage } from '../messages/action/MarketAddMessage';
import { MissingParamException } from '../exceptions/MissingParamException';

export class MarketAddValidator implements ActionMessageValidatorInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async validateMessage(message: MarketplaceMessage, direction: ActionDirection, smsgMessage?: resources.SmsgMessage): Promise<boolean> {

        const actionMessage = message.action as MarketAddMessage;
        // this.log.debug('actionMessage:', JSON.stringify(actionMessage, null, 2));

        if (actionMessage.type !== MPActionExtended.MPA_MARKET_ADD) {
            this.log.error('Not MPActionExtended.MPA_MARKET_ADD');
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPActionExtended.MPA_MARKET_ADD]);
        }

        if (_.isNil(actionMessage.name)) {
            throw new MissingParamException('name');
        }

        if (_.isNil(actionMessage.receiveKey)) {
            throw new MissingParamException('receiveKey');
        }

        if (_.isNil(actionMessage.publishKey)) {
            throw new MissingParamException('publishKey');
        }

        if (_.isNil(actionMessage.hash)) {
            throw new MissingParamException('hash');
        }

        if (_.isNil(actionMessage.generated)) {
            throw new MissingParamException('generated');
        }

        // this.log.debug('validateMessage(), message: ', JSON.stringify(message, null, 2));
        return true;

    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection, smsgMessage?: resources.SmsgMessage): Promise<boolean> {
        return true;
    }

}
