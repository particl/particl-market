// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { MarketService } from '../../services/model/MarketService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Market } from '../../models/Market';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MarketCreateRequest } from '../../requests/model/MarketCreateRequest';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MarketType } from '../../enums/MarketType';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ProfileService } from '../../services/model/ProfileService';
import { MessageException } from '../../exceptions/MessageException';
import { CoreRpcService } from '../../services/CoreRpcService';
import { WalletService } from '../../services/model/WalletService';

export class MarketAddCommand extends BaseCommand implements RpcCommandInterface<Market> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.WalletService) private walletService: WalletService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService
    ) {
        super(Commands.MARKET_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile: resources.Profile
     *  [1]: name
     *  [2]: type: MarketType
     *  [3]: receiveKey
     *  [4]: receiveAddress
     *  [5]: publishKey
     *  [6]: publishAddress
     *  [7]: wallet: resources.Wallet;
     *
     * @param data
     * @returns {Promise<Market>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Market> {
        const profile: resources.Profile = data.params[0];
        const wallet: resources.Wallet = data.params[7];

        /*
        // if wallet with the name doesnt exists, then create one
        const exists = await this.coreRpcService.walletExists(data.params[7]);
        if (!exists) {
            await this.coreRpcService.createWallet(data.params[7])
                .then(wallet => {
                    this.log.debug('created wallet: ', wallet.name);
                })
                .catch(reason => {
                    this.log.debug('wallet: ' + data.params[7] + ' already exists.');
                });
        }
        */

        return await this.marketService.create({
            profile_id: profile.id,
            wallet_id: wallet.id,
            name : data.params[1],
            type : data.params[2],
            receiveKey : data.params[3],
            receiveAddress : data.params[4],
            publishKey : data.params[5],
            publishAddress : data.params[6]
        } as MarketCreateRequest);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: name
     *  [2]: type: MarketType
     *  [3]: receiveKey
     *  [4]: receiveAddress
     *  [5]: publishKey
     *  [6]: publishAddress
     *  [7]: walletId, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        // TODO: generate the address from the pk

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('name');
        } else if (data.params.length < 3) {
            throw new MissingParamException('type');
        } else if (data.params.length < 4) {
            throw new MissingParamException('receiveKey');
        } else if (data.params.length < 5) {
            throw new MissingParamException('receiveAddress');
        } else if (data.params.length === 6) {
            throw new MissingParamException('publishAddress');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('name', 'string');
        } else if (typeof data.params[2] !== 'string') {
            throw new InvalidParamException('type', 'string');
        } else if (typeof data.params[3] !== 'string') {
            throw new InvalidParamException('receiveKey', 'string');
        } else if (typeof data.params[4] !== 'string') {
            throw new InvalidParamException('receiveAddress', 'string');
        } else if (data.params[5] && typeof data.params[5] !== 'string') {
            throw new InvalidParamException('publishKey', 'string');
        } else if (data.params[6] && typeof data.params[6] !== 'string') {
            throw new InvalidParamException('publishAddress', 'string');
        } else if (data.params[7] && typeof data.params[7] !== 'number') {
            throw new InvalidParamException('walletId', 'number');
        }

        if (!EnumHelper.containsName(MarketType, data.params[2])) {
            throw new InvalidParamException('type', 'MarketType');
        }

        // make sure Profile with the id exists
        const profile: resources.Profile = await this.profileService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        // make sure Market with the same name doesnt exists
        let market: resources.Market = await this.marketService.findOneByProfileIdAndName(profile.id, data.params[1])
            .then(value => value.toJSON())
            .catch(reason => {
                //
            });

        if (!_.isEmpty(market)) {
            throw new MessageException('Market with the name: ' + data.params[1] + ' already exists.');
        }

        let wallet: resources.Wallet;

        if (!_.isEmpty(data.params[7])) {
            // make sure Wallet with the id exists
            wallet = await this.walletService.findOne(data.params[7])
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Wallet');
                });

            if (wallet.Profile.id !== profile.id) {
                throw new MessageException('Wallet does not belong to the Profile.');
            }

        } else {
            wallet = await this.walletService.getDefaultForProfile(profile.id).then(value => value.toJSON());
        }

        // make sure Market with the same receiveAddress doesnt exists
        market = await this.marketService.findOneByProfileIdAndReceiveAddress(profile.id, data.params[4])
            .then(value => value.toJSON())
            .catch(reason => {
                //
            });

        if (!_.isEmpty(market)) {
            throw new MessageException('Market with the receiveAddress: ' + data.params[4] + ' already exists.');
        }

        if (_.isEmpty(data.params[7])) {
            // if no wallet name was given, create one (profileAddress-walletReceiveAddress.dat)
            data.params[7] = profile.address + '-' + data.params[4] + '.dat';
        }

        data.params[0] = profile;
        data.params[5] = data.params[5] ? data.params[5] : data.params[3];
        data.params[6] = data.params[6] ? data.params[6] : data.params[4];
        data.params[7] = wallet;
        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> <name> <type> <receiveKey> <receiveAddress> [publishKey] [publishAddress] [wallet] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>              - Number - The ID of the Profile for which the Market is added. \n'
            + '    <name>                   - String - The unique name of the Market being created. \n'
            + '    <type>                   - MarketType - MARKETPLACE \n'
            + '    <receiveKey>             - String - The receive private key of the Market. \n'
            + '    <receiveAddress>         - String - The receive address matching the receive private key. \n'
            + '    <publishKey>             - String, optional - The publish private key of the Market. \n'
            + '    <publishAddress>         - String, optional - The publish address matching the receive private key. \n'
            + '    <wallet>                 - String, optional - The wallet to be used with the Market. \n';
    }

    public description(): string {
        return 'Create a new Market.';
    }

    public example(): string {
        return 'market ' + this.getName() + ' market add 1 \'mymarket\' \'MARKETPLACE\' \'2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek\' ' +
            '\'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA\' \'2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek\' \'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA\' ' +
            '\'wallet.dat\' ';
    }
}
