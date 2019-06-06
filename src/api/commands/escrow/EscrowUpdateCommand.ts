// Copyright (c) 2017-2019, The Particl Market developers
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
import {Cryptocurrency} from 'omp-lib/dist/interfaces/crypto';
import {EscrowType} from 'omp-lib/dist/interfaces/omp-enums';
import {ModelNotModifiableException} from '../../exceptions/ModelNotModifiableException';

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
     *  [2]: buyerRatio
     *  [3]: sellerRatio
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
        }

        this.log.debug('data.params: ' + data.params);
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('escrowType', 'string');
        } else if (typeof data.params[2] !== 'number') {
            throw new InvalidParamException('buyerRatio', 'number');
        } else if (typeof data.params[3] !== 'number') {
            throw new InvalidParamException('sellerRatio', 'number');
        }

        const validEscrowTypes = [EscrowType.MAD_CT/*, EscrowType.MULTISIG, EscrowType.MAD, EscrowType.FE*/];
        if (validEscrowTypes.indexOf(data.params[1]) === -1) {
            throw new InvalidParamException('escrowType');
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

        if (await this.listingItemTemplateService.isModifiable(listingItemTemplate.id)) {
            throw new ModelNotModifiableException('ListingItemTemplate');
        }
        data.params[0] = listingItemTemplate;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> <escrowType> <buyerRatio> <sellerRatio> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <listingItemTemplateId>  - Numeric - The ID of the listing item template \n'
            + '                                associated with the escrow we want to modify. \n'
            + '    <escrowType>             - String - The escrow type we want to give to the \n'
            + '                                escrow we are modifying. \n'
            + '                             - ENUM{NOP,MAD} - The escrow type to give to the \n'
            + '                                escrow we are modifying. \n'
            + '    <buyerRatio>             - Numeric - [TODO] \n'
            + '    <sellerRatio>            - Numeric - [TODO] ';
    }

    public description(): string {
        return 'Update the details of an escrow given by listingItemTemplateId.';
    }


}
