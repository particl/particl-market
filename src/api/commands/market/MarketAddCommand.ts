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
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { ProfileService } from '../../services/model/ProfileService';
import { MessageException } from '../../exceptions/MessageException';
import { CoreRpcService } from '../../services/CoreRpcService';
import { IdentityService } from '../../services/model/IdentityService';
import { ItemCategoryService } from '../../services/model/ItemCategoryService';
import { MarketAddMessage } from '../../messages/action/MarketAddMessage';
import { MarketCreateParams } from '../../factories/ModelCreateParams';
import { MarketFactory } from '../../factories/model/MarketFactory';
import { MarketRegion } from '../../enums/MarketRegion';
import {
    BooleanValidationRule,
    CommandParamValidationRules,
    EnumValidationRule,
    IdValidationRule,
    ParamValidationRule,
    StringValidationRule
} from '../CommandParamValidation';
import { PublicKey, PrivateKey, Networks } from 'particl-bitcore-lib';
import {InvalidParamException} from '../../exceptions/InvalidParamException';


export class MarketAddCommand extends BaseCommand implements RpcCommandInterface<resources.Market> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.model.MarketFactory) public marketFactory: MarketFactory,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService
    ) {
        super(Commands.MARKET_ADD);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('profileId', true, this.profileService),
                new StringValidationRule('name', true),
                new EnumValidationRule('type', false, 'MarketType',
                    EnumHelper.getValues(MarketType) as string[], MarketType.MARKETPLACE,
                    async (value, index, allValues) => {
                        const validEnumValues = EnumHelper.getValues(MarketType) as string[];
                        if (!_.isNil(value) && validEnumValues.indexOf(value) === -1) {
                            return false;
                        }

                        let type = value;
                        const receiveKey = allValues[index + 1];
                        const publishKey = allValues[index + 2];

                        if (!_.isNil(receiveKey) && !_.isNil(publishKey)) {
                            if (receiveKey === publishKey) {
                                // keys are same -> MARKETPLACE
                                if (!this.isPrivateKey(receiveKey)) {
                                    throw new MessageException('Invalid receiveKey for MARKETPLACE.');
                                }
                                if (!this.isPrivateKey(publishKey)) {
                                    throw new MessageException('Invalid publishKey for MARKETPLACE.');
                                }
                                // type should be MARKETPLACE, just fix it if not
                                type = MarketType.MARKETPLACE;
                            } else {
                                // different keys -> STOREFRONT / STOREFRONT_ADMIN
                                if (this.isPrivateKey(receiveKey) && this.isPrivateKey(publishKey)) {
                                    type = MarketType.STOREFRONT_ADMIN;
                                } else if (this.isPrivateKey(receiveKey) && this.isPublicKey(publishKey)) {
                                    type = MarketType.STOREFRONT;
                                }
                            }
                        } else if (type === MarketType.STOREFRONT && (_.isNil(receiveKey) || _.isNil(publishKey))) {
                            // in case of a STOREFRONT, both keys should have been given
                            throw new MessageException('Adding a STOREFRONT requires both receive and publish keys.');
                        }
                        return type;
                    }),
                new StringValidationRule('receiveKey', false, undefined,
                    async (value, index, allValues) => {
                            // if set, should be a valid public/private key
                        if (!_.isNil(value) && !this.isPublicKey(value) && !this.isPrivateKey(value)) {
                            throw new InvalidParamException('receiveKey');
                        }
                        return true;
                    }),
                new StringValidationRule('publishKey', false, undefined,
                    async (value, index, allValues) => {
                        // if set, should be a valid public/private key
                        if (!_.isNil(value) && !this.isPublicKey(value) && !this.isPrivateKey(value)) {
                            throw new InvalidParamException('publishKey');
                        }
                        return true;
                    }),
                new IdValidationRule('identityId', false, this.identityService),
                new StringValidationRule('description', false),
                new EnumValidationRule('region', false, 'MarketRegion',
                    EnumHelper.getValues(MarketRegion) as string[], MarketRegion.WORLDWIDE),
                new BooleanValidationRule('skipJoin', false, false)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: profile: resources.Profile
     *  [1]: name
     *  [2]: type: MarketType
     *  [3]: receiveKey: private key in wif format
     *  [4]: publishKey: private key in wif format or public key as DER hex encoded string
     *  [5]: identity: resources.Identity
     *  [6]: description
     *  [7]: region
     *  [8]: skipJoin
     *
     * @param data
     * @returns {Promise<Market>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<resources.Market> {
        const profile: resources.Profile = data.params[0];
        const name: string = data.params[1];
        const type: MarketType = data.params[2];
        const receiveKey: string = data.params[3];
        const publishKey: string = data.params[4];
        let identity: resources.Identity = data.params[5];
        const description: string = data.params[6];
        const region: string = data.params[7];
        const skipJoin: boolean = data.params[8];

        // create market identity if one wasn't given
        if (_.isNil(identity) && !skipJoin) {
            identity = await this.identityService.createMarketIdentityForProfile(profile, name).then(value => value.toJSON());
        }

        const createRequest: MarketCreateRequest = await this.marketFactory.get({
            actionMessage: {
                name,
                description,
                marketType: type,
                region,
                receiveKey,
                publishKey,
                // todo: add logo for the default market
                // image: ContentReference,
                generated: Date.now()
            } as MarketAddMessage,
            identity,   // Identity required to create keys
            skipJoin
        } as MarketCreateParams);

        if (skipJoin) {
            // make sure that unjoined Market with the same hash doesnt exists
            await this.marketService.findAllByHash(createRequest.hash)
                .then(value => {
                    const allMarkets: resources.Market[] = value.toJSON();
                    for (const market of allMarkets) {
                        if (_.isNil(market.Profile)) {
                            // unjoined market exists
                            throw new MessageException('Market already exists.');
                        }
                    }
                });
        } else {
            // make sure joined Market with the same receiveAddress doesnt exists
            await this.marketService.findOneByProfileIdAndReceiveAddress(profile.id, createRequest.receiveAddress)
                .then(value => {
                    throw new MessageException('Market with the receiveAddress: ' + createRequest.receiveAddress + ' already exists.');
                })
                .catch(reason => {
                    //
                });
        }

        // create the market
        return await this.marketService.create(createRequest).then(async value => {
            const market: resources.Market = value.toJSON();

            if (!skipJoin && !_.isNil(market.Identity.id) && !_.isNil(market.Identity.Profile.id)) {
                await this.marketService.joinMarket(market);
            }

            // create root category for market
            await this.itemCategoryService.insertRootItemCategoryForMarket(createRequest.receiveAddress);

            return market;
        });
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: name
     *  [2]: type: MarketType, optional, default=MARKETPLACE
     *  [3]: receiveKey, optional, private key in wif format
     *  [4]: publishKey, optional, if type === STOREFRONT -> public key as DER hex encoded string
     *                             if type === STOREFRONT_ADMIN -> private key in wif format
     *  [5]: identityId, optional
     *  [6]: description, optional
     *  [7]: region, optional
     *  [8]: skipJoin, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const profile: resources.Profile = data.params[0];
        const name = data.params[1];
        let type = data.params[2];
        const receiveKey = data.params[3];
        const publishKey = data.params[4];
        const identity: resources.Identity = data.params[5];
        const description = data.params[6];
        const region = data.params[7];
        const skipJoin = data.params[8];

        await this.checkForDuplicateMarketName(profile.id, name);

        // type === MARKETPLACE -> receive + publish keys are the same, both are private keys
        // type === STOREFRONT -> receive key is private key, publish key is public key
        //                        when adding a storefront, both keys should be given
        //                        (because you cannot post here, so you are only joining markets that someone else created)
        // type === STOREFRONT_ADMIN -> receive key is private key, publish key is private key, bot keys are different
        // the keys which are undefined should be generated
/*
        if (!_.isNil(receiveKey) && !_.isNil(publishKey)) {
            if (receiveKey === publishKey) {
                // keys are same -> MARKETPLACE

                if (!this.isPrivateKey(receiveKey)) {
                    throw new MessageException('Invalid receiveKey for MARKETPLACE.');
                }
                if (!this.isPrivateKey(publishKey)) {
                    throw new MessageException('Invalid publishKey for MARKETPLACE.');
                }
                // type should be MARKETPLACE, just fix it if not
                type = MarketType.MARKETPLACE;
            } else {
                // different keys -> STOREFRONT / STOREFRONT_ADMIN
                if (this.isPrivateKey(receiveKey) && this.isPrivateKey(publishKey)) {
                    type = MarketType.STOREFRONT_ADMIN;
                } else if (this.isPrivateKey(receiveKey) && this.isPublicKey(publishKey)) {
                    type = MarketType.STOREFRONT;
                }
            }
        } else if (type === MarketType.STOREFRONT && (_.isNil(receiveKey) || _.isNil(publishKey))) {
            // in case of a STOREFRONT, both keys should have been given
            throw new MessageException('Adding a STOREFRONT requires both receive and publish keys.');
        }
*/
        // make sure Identity belongs to the given Profile
        if (!_.isNil(identity) && identity.Profile.id !== profile.id) {
            throw new MessageException('Identity does not belong to the Profile.');
        }

        type = skipJoin ? MarketType.MARKETPLACE : type;

        data.params[0] = profile;
        data.params[1] = name;
        data.params[2] = type;
        data.params[3] = receiveKey;
        data.params[4] = publishKey;
        data.params[6] = description;
        data.params[7] = region;
        data.params[8] = skipJoin;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> <name> [type] [receiveKey] [publishKey] [identityId] [description] [region] [skipJoin]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>              - number - The ID of the Profile for which the Market is added. \n'
            + '    <name>                   - string - The unique name of the Market being created. \n'
            + '    <type>                   - [optional], MarketType, The type of the Market. \n'
            + '    <receiveKey>             - [optional], string, The receive private key of the Market. \n'
            + '    <publishKey>             - [optional], string, The publish private key of the Market. \n'
            + '    <identityId>             - [optional], number, The identity to be used with the Market. \n'
            + '    <description>            - [optional], string, Market description. \n'
            + '    <region>                 - [optional], string, Market region. \n'
            + '    <skipJoin>               - [optional], string, skip Market join. \n';
    }

    public description(): string {
        return 'Create a new Market.';
    }

    public example(): string {
        return 'market ' + this.getName() + ' market add 1 \'mymarket\' \'MARKETPLACE\' \'2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek\' ' +
            '\'2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek\' ';
    }

    private async checkForDuplicateMarketName(profileId: number, name: string): Promise<void> {
        // make sure Market with the same name doesn't exists for the Profile
        // we can't check for the receiveAAddress yet, because we don't know it
        await this.marketService.findAllByProfileId(profileId)
            .then(values => {
                const markets: resources.Market[] = values.toJSON();
                const found = _.find(markets, market => {
                    return market.name === name;
                });
                if (!_.isNil(found)) {
                    throw new MessageException('Market with the name: ' + name + ' already exists.');
                }
            });
    }

    // TODO: move to util
    /**
     * @param key, in wif
     */
    private isPrivateKey(key: string): boolean {
        try {
            PrivateKey.fromWIF(key);
        } catch (e) {
            return false;
        }
        return true;
    }

    // TODO: move to util
    /**
     * @param key, should be der hex string
     */
    private isPublicKey(key: string): boolean {
        try {
            PublicKey.fromString(key);
        } catch (e) {
            return false;
        }
        return true;
    }
}
