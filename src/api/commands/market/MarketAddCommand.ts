// Copyright (c) 2017-2020, The Particl Market developers
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
import { IdentityService } from '../../services/model/IdentityService';
import { PublicKey, PrivateKey, Networks } from 'particl-bitcore-lib';
import { RpcBlockchainInfo } from 'omp-lib/dist/interfaces/rpc';
import { NotImplementedException } from '../../exceptions/NotImplementedException';

export class MarketAddCommand extends BaseCommand implements RpcCommandInterface<Market> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
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
     *  [3]: receiveKey: private key in wif format
     *  [4]: receiveAddress
     *  [5]: publishKey: private key in wif format or public key as DER hex encoded string
     *  [6]: publishAddress
     *  [7]: identity: resources.Identity
     *
     * @param data
     * @returns {Promise<Market>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Market> {
        const profile: resources.Profile = data.params[0];
        const name: string = data.params[1];
        let identity: resources.Identity = data.params[7];

        if (_.isEmpty(identity)) {
            identity = await this.identityService.createMarketIdentityForProfile(profile, name).then(value => value.toJSON());
        }

        return await this.marketService.create({
            profile_id: profile.id,
            identity_id: identity.id,
            name,
            type: data.params[2],
            receiveKey: data.params[3],
            receiveAddress: data.params[4],
            publishKey : data.params[5],
            publishAddress : data.params[6]
        } as MarketCreateRequest);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: name
     *  [2]: type: MarketType, optional, default=MARKETPLACE
     *  [3]: receiveKey, optional, private key in wif format
     *  [4]: publishKey, optional, if type === STOREFRONT -> public key as DER hex encoded string, else private key in wif format
     *  [5]: identityId, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('name');
        }
/*
        else if (data.params.length < 3) {
            throw new MissingParamException('type');
        } else if (data.params.length < 4) {
            throw new MissingParamException('receiveKey');
        } else if (data.params.length < 5) {
            throw new MissingParamException('receiveAddress');
        } else if (data.params.length === 6) {
            throw new MissingParamException('publishAddress');
        }
*/
        const profileId = data.params[0];
        const name = data.params[1];
        let type = data.params[2];
        let receiveKey = data.params[3];
        let receiveAddress;
        let publishKey = data.params[4];
        let publishAddress;
        const identityId = data.params[5];

        // make sure the params are of correct type
        if (typeof profileId !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        } else if (typeof name !== 'string') {
            throw new InvalidParamException('name', 'string');
        } else if (type !== undefined && typeof type !== 'string') {
            throw new InvalidParamException('type', 'string');
        } else if (receiveKey !== undefined && typeof receiveKey !== 'string') {
            throw new InvalidParamException('receiveKey', 'string');
        // } else if (receiveAddress !== undefined && typeof receiveAddress !== 'string') {
        //     throw new InvalidParamException('receiveAddress', 'string');
        } else if (publishKey !== undefined && typeof publishKey !== 'string') {
            throw new InvalidParamException('publishKey', 'string');
        // } else if (publishAddress !== undefined && typeof publishAddress !== 'string') {
        //     throw new InvalidParamException('publishAddress', 'string');
        } else if (identityId !== undefined && typeof identityId !== 'number') {
            throw new InvalidParamException('identityId', 'number');
        }

        // make sure Profile with the id exists
        const profile: resources.Profile = await this.profileService.findOne(profileId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        // make sure Market with the same name doesnt exists for the Profile
        await this.marketService.findOneByProfileIdAndName(profile.id, name)
            .then(value => {
                throw new MessageException('Market with the name: ' + name + ' already exists.');
            })
            .catch(reason => {
                //
            });

        if (_.isEmpty(type)) {
            // default market type to MARKETPLACE if not set
            type = MarketType.MARKETPLACE;
        } else if (!EnumHelper.containsName(MarketType, type)) {
            // invalid MarketType
            throw new InvalidParamException('type', 'MarketType');
        }

        // type === MARKETPLACE -> receive + publish keys are the same
        // type === STOREFRONT -> receive key is private key, publish key is public key
        //                        when adding a storefront, both keys should be given
        // type === STOREFRONT_ADMIN -> receive + publish keys are different
        // the keys which are undefined should be generated

        // for STOREFRONT, both keys should have been given
        if (type === MarketType.STOREFRONT && (_.isEmpty(receiveKey) || _.isEmpty(publishKey))) {
            throw new MessageException('Adding a STOREFRONT requires both receive and publish keys.');
        }

        const blockchainInfo: RpcBlockchainInfo = await this.coreRpcService.getBlockchainInfo();
        const network = blockchainInfo.chain === 'main' ? Networks.mainnet : Networks.testnet;

        // generate new key if receiveKey wasnt given and get the address
        // else just get the address for the given pk
        if (_.isEmpty(receiveKey)) {
            const privateKey: PrivateKey = PrivateKey.fromRandom(network);
            receiveKey = privateKey.toWIF();
            receiveAddress = privateKey.toPublicKey().toAddress(network).toString();
        } else {
            // receiveKey was given, get the receiveAddress
            receiveAddress = PrivateKey.fromWIF(receiveKey).toPublicKey().toAddress(network).toString();
        }

        // we have receiveKey and receiveAddress, next get the publishKey and publishAddress
        switch (type) {
            case MarketType.MARKETPLACE:
                // receive + publish keys are the same
                publishKey = receiveKey;
                publishAddress = receiveAddress;
                break;

            case MarketType.STOREFRONT:
                // both keys should have been given
                // publish key is public key (DER hex encoded string)
                publishAddress = PublicKey.fromString(publishKey).toAddress(network).toString();
                break;

            case MarketType.STOREFRONT_ADMIN:
                // receive + publish keys are different, both private keys
                if (receiveKey === publishKey) {
                    throw new MessageException('Adding a STOREFRONT_ADMIN requires different receive and publish keys.');
                }

                // generate new publish key if publishKey wasnt given and get the address
                // else just get the address for the given pk
                if (_.isEmpty(publishKey)) {
                    const privateKey: PrivateKey = PrivateKey.fromRandom(network);
                    publishKey = privateKey.toWIF();
                    publishAddress = privateKey.toPublicKey().toAddress(network).toString();
                } else {
                    // publishKey was given, get the publishAddress
                    publishAddress = PrivateKey.fromWIF(publishKey).toPublicKey().toAddress(network).toString();
                }
                break;

            default:
                throw new NotImplementedException();
        }

        let identity: resources.Identity;
        if (!_.isEmpty(identityId)) {
            // make sure Identity with the id exists
            identity = await this.identityService.findOne(identityId)
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Identity');
                });

            // make sure Identity belongs to the given Profile
            if (identity.Profile.id !== profile.id) {
                throw new MessageException('Identity does not belong to the Profile.');
            }
            data.params[7] = identity;

        }

        // make sure Market with the same receiveAddress doesnt exists
        await this.marketService.findOneByProfileIdAndReceiveAddress(profile.id, receiveAddress)
            .then(value => {
                throw new MessageException('Market with the receiveAddress: ' + receiveAddress + ' already exists.');
            })
            .catch(reason => {
                //
            });

        data.params[0] = profile;
        data.params[2] = type;
        data.params[3] = receiveKey;
        data.params[4] = receiveAddress;
        data.params[5] = publishKey;
        data.params[6] = publishAddress;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> <name> [type] [receiveKey] [publishKey] [identityId] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>              - Number - The ID of the Profile for which the Market is added. \n'
            + '    <name>                   - String - The unique name of the Market being created. \n'
            + '    <type>                   - MarketType, optional - MARKETPLACE \n'
            + '    <receiveKey>             - String, optional - The receive private key of the Market. \n'
            // + '    <receiveAddress>         - String, optional - The receive address matching the receive private key. \n'
            + '    <publishKey>             - String, optional - The publish private key of the Market. \n'
            // + '    <publishAddress>         - String, optional - The publish address matching the receive private key. \n'
            + '    <identityId>             - Number, optional - The identity to be used with the Market. \n';
    }

    public description(): string {
        return 'Create a new Market.';
    }

    public example(): string {
        return 'market ' + this.getName() + ' market add 1 \'mymarket\' \'MARKETPLACE\' \'2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek\' ' +
            '\'2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek\' ';
    }
}
