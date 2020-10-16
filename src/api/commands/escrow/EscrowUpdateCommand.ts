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
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { EscrowReleaseType, EscrowType } from 'omp-lib/dist/interfaces/omp-enums';
import { ModelNotModifiableException } from '../../exceptions/ModelNotModifiableException';
import {
    CommandParamValidationRules, EnumValidationRule,
    EscrowRatioValidationRule,
    IdValidationRule,
    ParamValidationRule
} from '../CommandParamValidation';
import { EnumHelper } from '../../../core/helpers/EnumHelper';


export class EscrowUpdateCommand extends BaseCommand implements RpcCommandInterface<Escrow> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.EscrowService) private escrowService: EscrowService
    ) {
        super(Commands.ESCROW_UPDATE);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('listingItemTemplateId', true, this.listingItemTemplateService),
                new EnumValidationRule('escrowType', true, 'EscrowType',
                    [EscrowType.MAD_CT] as string[], EscrowType.MAD_CT),
                new EscrowRatioValidationRule('buyerRatio', true, 100),
                new EscrowRatioValidationRule('sellerRatio', true, 100),
                new EnumValidationRule('escrowReleaseType', false, 'EscrowReleaseType',
                    EnumHelper.getValues(EscrowReleaseType) as string[], EscrowReleaseType.ANON)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
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
            } as EscrowRatioUpdateRequest,
            releaseType: data.params[4]
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
        await super.validate(data);

        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];

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
        return this.getName() + ' <listingItemTemplateId> [escrowType] [buyerRatio] [sellerRatio] [escrowReleaseType] ';
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
