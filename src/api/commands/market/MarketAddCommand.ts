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
import {BaseCommand, CommandParamValidationRules, ParamValidationRule} from '../BaseCommand';
import { MarketType } from '../../enums/MarketType';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ProfileService } from '../../services/model/ProfileService';
import { MessageException } from '../../exceptions/MessageException';
import { CoreRpcService } from '../../services/CoreRpcService';
import { IdentityService } from '../../services/model/IdentityService';
import { ItemCategoryService } from '../../services/model/ItemCategoryService';
import { MarketAddMessage } from '../../messages/action/MarketAddMessage';
import { MarketCreateParams } from '../../factories/model/ModelCreateParams';
import { MarketFactory } from '../../factories/model/MarketFactory';

export class MarketAddCommand extends BaseCommand implements RpcCommandInterface<resources.Market> {

    public paramValidationRules = {
        parameters: [{
            name: 'profileId',
            required: true,
            type: 'number'
        }, {
            name: 'name',
            required: true,
            type: 'string'
        }, {
            name: 'type',
            required: false,
            type: 'string'
        }, {
            name: 'receiveKey',
            required: false,
            type: 'string'
        }, {
            name: 'publishKey',
            required: false,
            type: 'string'
        }, {
            name: 'identityId',
            required: false,
            type: 'number'
        }, {
            name: 'description',
            required: false,
            type: 'string'
        }] as ParamValidationRule[]
    } as CommandParamValidationRules;

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

    /**
     * data.params[]:
     *  [0]: profile: resources.Profile
     *  [1]: name
     *  [2]: type: MarketType
     *  [3]: receiveKey: private key in wif format
     *  [4]: publishKey: private key in wif format or public key as DER hex encoded string
     *  [5]: identity: resources.Identity
     *  [6]: description
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

        // create market identity if one wasnt given
        if (_.isEmpty(identity)) {
            identity = await this.identityService.createMarketIdentityForProfile(profile, name).then(value => value.toJSON());
        }

        const createRequest: MarketCreateRequest = await this.marketFactory.get({
            actionMessage: {
                name,
                description,
                marketType: type,
                receiveKey,
                publishKey,
                // todo: add logo for the default market
                // image: ContentReference,
                generated: Date.now()
            } as MarketAddMessage,
            identity
        } as MarketCreateParams);

        // make sure Market with the same receiveAddress doesnt exists
        await this.marketService.findOneByProfileIdAndReceiveAddress(profile.id, createRequest.receiveAddress)
            .then(value => {
                throw new MessageException('Market with the receiveAddress: ' + createRequest.receiveAddress + ' already exists.');
            })
            .catch(reason => {
                //
            });

        // create the market
        return await this.marketService.create(createRequest).then(async value => {
            const market: resources.Market = value.toJSON();

            if (!_.isNil(market.Identity.id) && !_.isNil(market.Identity.Profile.id)) {
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
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

/*
        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('name');
        }
*/
        const profileId = data.params[0];
        const name = data.params[1];
        let type = data.params[2];
        const receiveKey = data.params[3];
        const publishKey = data.params[4];
        const identityId = data.params[5];
        const description = data.params[6];

        this.log.debug('params: ', data.params);


/*
        if (typeof profileId !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        } else if (typeof name !== 'string') {
            throw new InvalidParamException('name', 'string');
        } else if (!_.isNil(type) && typeof type !== 'string') {
            throw new InvalidParamException('type', 'string');
        } else if (!_.isNil(receiveKey) && typeof receiveKey !== 'string') {
            throw new InvalidParamException('receiveKey', 'string');
        } else if (!_.isNil(publishKey) && typeof publishKey !== 'string') {
            throw new InvalidParamException('publishKey', 'string');
        } else if (!_.isNil(identityId) && typeof identityId !== 'number') {
            throw new InvalidParamException('identityId', 'number');
        } else if (!_.isNil(description) && typeof description !== 'number') {
            throw new InvalidParamException('description', 'string');
        }
*/
        // make sure Profile with the id exists
        const profile: resources.Profile = await this.profileService.findOne(profileId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        await this.checkForDuplicateMarketName(profile.id, name);

        if (_.isNil(type)) {
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
        if (type === MarketType.STOREFRONT && (_.isNil(receiveKey) || _.isNil(publishKey))) {
            throw new MessageException('Adding a STOREFRONT requires both receive and publish keys.');
        }

        // this.log.debug('receiveKey: ', receiveKey);

        let identity: resources.Identity;
        if (!_.isNil(identityId)) {
            identity = await this.identityService.findOne(identityId)
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Identity');
                });

            // make sure Identity belongs to the given Profile
            if (identity.Profile.id !== profile.id) {
                throw new MessageException('Identity does not belong to the Profile.');
            }
            data.params[5] = identity;
        }

        data.params[0] = profile;
        data.params[1] = name;
        data.params[2] = type;
        data.params[3] = receiveKey;
        data.params[4] = publishKey;
        data.params[6] = description;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> <name> [type] [receiveKey] [publishKey] [identityId] [description]';
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
            + '    <identityId>             - Number, optional - The identity to be used with the Market. \n'
            + '    <description>            - String, optional - Market description. \n';
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
}
