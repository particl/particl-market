// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { EscrowService } from '../../services/model/EscrowService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { EscrowUpdateRequest } from '../../requests/model/EscrowUpdateRequest';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { EscrowRatioUpdateRequest } from '../../requests/model/EscrowRatioUpdateRequest';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import {EscrowReleaseType, EscrowType} from 'omp-lib/dist/interfaces/omp-enums';
import { ModelNotModifiableException } from '../../exceptions/ModelNotModifiableException';

export class EscrowUpdateCommand extends BaseCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.EscrowService) private escrowService: EscrowService
    ) {
        super(Commands.ESCROW_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: escrowType
     *  [1]: escrowType
     *  [2]: buyerRatio
     *  [3]: sellerRatio
     *  [4]: escrowReleaseType
     *
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Escrow> {

        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];

        const escrowUpdateRequest = {
            type: data.params[1],
            ratio: {
                buyer: data.params[2],
                seller: data.params[3]
            } as EscrowRatioUpdateRequest
        } as EscrowUpdateRequest;

        return this.escrowService.update(listingItemTemplate.PaymentInformation.Escrow.id, escrowUpdateRequest);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: escrowType
     *  [2]: buyerRatio
     *  [3]: sellerRatio
     *  [4]: escrowReleaseType
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('escrowType');
        } else if (data.params.length < 3) {
            throw new MissingParamException('buyerRatio');
        } else if (data.params.length < 4) {
            throw new MissingParamException('sellerRatio');
        } else if (data.params.length < 5) {
            throw new MissingParamException('escrowReleaseType');
        }

        // this.log.debug('data.params: ' + data.params);
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('escrowType', 'string');
        } else if (typeof data.params[2] !== 'number') {
            throw new InvalidParamException('buyerRatio', 'number');
        } else if (typeof data.params[3] !== 'number') {
            throw new InvalidParamException('sellerRatio', 'number');
        } else if (typeof data.params[4] !== 'string') {
            throw new InvalidParamException('escrowReleaseType', 'string');
        }

        const validEscrowTypes = [EscrowType.MAD_CT/*, EscrowType.MULTISIG, EscrowType.MAD, EscrowType.FE*/];
        if (validEscrowTypes.indexOf(data.params[1]) === -1) {
            throw new InvalidParamException('escrowType');
        }

        const escrowReleaseTypes = [EscrowReleaseType.ANON, EscrowReleaseType.BLIND];
        if (escrowReleaseTypes.indexOf(data.params[1]) === -1) {
            throw new InvalidParamException('escrowReleaseType');
        }

        // make sure ListingItemTemplate with the id exists
        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0])
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new ModelNotFoundException('ListingItemTemplate');
            });

        // make sure PaymentInformation exists
        if (_.isEmpty(listingItemTemplate.PaymentInformation)) {
            throw new ModelNotFoundException('PaymentInformation');
        }

        // make sure Escrow exists
        if (_.isEmpty(listingItemTemplate.PaymentInformation.Escrow)) {
            throw new ModelNotFoundException('Escrow');
        }

        const isModifiable = await this.listingItemTemplateService.isModifiable(listingItemTemplate.id);
        if (!isModifiable) {
            throw new ModelNotModifiableException('ListingItemTemplate');
        }
        data.params[0] = listingItemTemplate;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> <escrowType> <buyerRatio> <sellerRatio> <escrowReleaseType> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <listingItemTemplateId>  - Numeric - The ID of the ListingItemTemplate. \n'
            + '    <escrowType>             - EscrowType - The escrow type. \n'
            + '    <buyerRatio>             - Numeric - The ratio of the buyer. \n'
            + '    <sellerRatio>            - Numeric - The ratio of the seller. \n'
            + '    <escrowReleaseType>      - EscrowReleaseType - The type of funds to release. \\n\'';
    }

    public description(): string {
        return 'Update the details of an Escrow.';
    }

    public example(): string {
        return '';
    }
}
