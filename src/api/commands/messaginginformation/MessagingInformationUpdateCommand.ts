// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { MessagingInformationService } from '../../services/model/MessagingInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { MessagingInformationUpdateRequest } from '../../requests/model/MessagingInformationUpdateRequest';
import { MessagingInformation } from '../../models/MessagingInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ModelNotModifiableException } from '../../exceptions/ModelNotModifiableException';
import { MessagingProtocol } from 'omp-lib/dist/interfaces/omp-enums';

export class MessagingInformationUpdateCommand extends BaseCommand implements RpcCommandInterface<MessagingInformation> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.MessagingInformationService) private messagingInformationService: MessagingInformationService
    ) {
        super(Commands.MESSAGINGINFORMATION_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate, resources.ListingItemTemplate
     *  [1]: protocol (MessagingProtocol)
     *  [2]: publicKey
     *
     * @param data
     * @returns {Promise<MessagingInformation>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<MessagingInformation> {

        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];

        // todo: updates only the first one
        return this.messagingInformationService.update(listingItemTemplate.MessagingInformation[0].id, {
            listing_item_template_id: listingItemTemplate.id,
            protocol: data.params[1],
            publicKey: data.params[2]
        } as MessagingInformationUpdateRequest);

    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: protocol (MessagingProtocol)
     *  [2]: publicKey
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('protocol');
        } else if (data.params.length < 3) {
            throw new MissingParamException('publicKey');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('protocol', 'string');
        } else if (typeof data.params[2] !== 'string') {
            throw new InvalidParamException('publicKey', 'string');
        }

        // make sure ListingItemTemplate with the id exists
        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0])
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new ModelNotFoundException('ListingItemTemplate');
            });

        // make sure MessagingInformation exists
        if (_.isEmpty(listingItemTemplate.MessagingInformation)) {
            throw new ModelNotFoundException('MessagingInformation');
        }

        const validProtocolTypes = [MessagingProtocol.SMSG];
        if (validProtocolTypes.indexOf(data.params[1]) === -1) {
            throw new InvalidParamException('protocol');
        }

        const isModifiable = await this.listingItemTemplateService.isModifiable(listingItemTemplate.id);
        if (!isModifiable) {
            throw new ModelNotModifiableException('ListingItemTemplate');
        }

        data.params[0] = listingItemTemplate;

        return data;
    }


    public usage(): string {
        return this.getName() + ' <listingTemplateId> <protocol> <publicKey> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>      - Numeric - [TODO] \n'
            + '    <protocol>               - ENUM{SMSG} - [TODO] \n'
            + '    <publicKey>              - String - [TODO] ';
    }

    public description(): string {
        return 'Update the details of messaging information associated with listingTemplateId.';
    }

    public example(): string {
        return '';
    }
}
