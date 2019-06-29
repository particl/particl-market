// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/model/ItemCategoryService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import {MissingParamException} from '../../exceptions/MissingParamException';
import {InvalidParamException} from '../../exceptions/InvalidParamException';

export class ItemCategorySearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ItemCategory>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) private itemCategoryService: ItemCategoryService
    ) {
        super(Commands.CATEGORY_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: searchBy, string, can't be null
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ItemCategory>> {
        return await this.itemCategoryService.findByName(data.params[0]);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('searchBy');
        }

        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('searchBy', 'string');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <searchString> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <searchBy>                - String - A searchBy string for finding \n'
            + '                                     categories by name. ';
    }

    public description(): string {
        return 'Command for getting an item categories searchBy by particular searchBy string';
    }

    public example(): string {
        return 'category ' + this.getName() + ' luxury ';
    }
}
