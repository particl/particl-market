// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ImageService } from '../../services/model/ImageService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { ModelNotModifiableException } from '../../exceptions/ModelNotModifiableException';
import { CommandParamValidationRules, ParamValidationRule } from '../CommandParamValidation';


export class ImageRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {


    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ImageService) private imageService: ImageService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.IMAGE_REMOVE);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [{
                name: 'id',
                required: true,
                type: 'number'
            }] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: imageId
     *
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        return this.imageService.destroy(data.params[0]);
    }

    /**
     * data.params[]:
     *  [0]: imageId
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const id = data.params[0];

        const image: resources.Image = await this.imageService.findOne(id).then(value => value.toJSON());

        // if Image has a relation to ItemInformation and ListingItemTemplate, it cannot be deleted
        if (!_.isEmpty(image.ItemInformation) && !_.isEmpty(image.ItemInformation.ListingItemTemplate)) {

            const templateId = image.ItemInformation.ListingItemTemplate.id;
            const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(templateId)
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('ListingItemTemplate');
                });

            const isModifiable = await this.listingItemTemplateService.isModifiable(listingItemTemplate.id);
            if (!isModifiable) {
                throw new ModelNotModifiableException('ListingItemTemplate');
            }

        } else {
            throw new ModelNotModifiableException('ListingItemTemplate');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <id> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <id>                 - number - The ID of the Image to be removed.';
    }

    public description(): string {
        return 'Remove an Image, identified by its Id.';
    }

    public example(): string {
        return 'image ' + this.getName() + ' 1 ';
    }
}
