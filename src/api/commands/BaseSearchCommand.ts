// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { Command } from './Command';
import { RpcRequest } from '../requests/RpcRequest';
import { BaseCommand } from './BaseCommand';
import { MissingParamException } from '../exceptions/MissingParamException';
import { InvalidParamException } from '../exceptions/InvalidParamException';
import { EnumHelper } from '../../core/helpers/EnumHelper';
import { SearchOrder } from '../enums/SearchOrder';

export abstract class BaseSearchCommand extends BaseCommand {

    constructor(command: Command) {
        super(command);
    }

    /**
     * Should return the orderFields which are allowed for this particular Command
     *
     * Create a StringEnum where:
     *   key is the value passed for the Command and
     *   value being the db field for the Model class
     * see CommentSearchOrderField
     */
    public abstract getAllowedSearchOrderFields(): string[];

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        return await this.validateSearchParams(data);
    }

    /**
     * data.params[]:
     *  [0]: page, number, required, 0-based
     *  [1]: pageLimit, number, required
     *  [2]: order, SearchOrder, required
     *  [3]: orderField, SearchOrderField, required, field to which the SearchOrder is applied
     *  ...
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validateSearchParams(data: RpcRequest): Promise<RpcRequest> {

        const page = data.params[0];
        const pageLimit = data.params[1];
        const order = data.params[2];
        const orderField = data.params[3];

        // make sure all required parameters exist
        if (data.params.length < 1) {
            throw new MissingParamException('page');
        } else if (data.params.length < 2) {
            throw new MissingParamException('pageLimit');
        } else if (data.params.length < 3) {
            throw new MissingParamException('order');
        } else if (data.params.length < 4) {
            throw new MissingParamException('orderField');
        }

        // make sure the params are of correct type
        if (typeof page !== 'number' || page < 0) {
            throw new InvalidParamException('page', 'number');
        } else if (typeof pageLimit !== 'number' || pageLimit <= 0) {
            throw new InvalidParamException('pageLimit', 'number');
        } else if (typeof order !== 'string') {
            throw new InvalidParamException('order', 'string');
        } else if (typeof orderField !== 'string') {
            throw new InvalidParamException('orderField', 'string');
        }

        // valid SearchOrder?
        if (!EnumHelper.containsName(SearchOrder, order)) {
            throw new InvalidParamException('order', 'SearchOrder.' + EnumHelper.getNames(SearchOrder));
        }

        // valid orderField?
        if (!_.includes(this.getAllowedSearchOrderFields(), orderField)) {
            throw new InvalidParamException('orderField',  '' + this.getAllowedSearchOrderFields());
        }
        return data;
    }

}
