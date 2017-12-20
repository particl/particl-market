import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import * as _ from 'lodash';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemPrice } from '../models/ItemPrice';
import { ItemPriceMessage } from '../messages/ItemPriceMessage';
import { Currency } from '../enums/Currency';

export class ItemPriceFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * data:
     *  currency: ENUM Currency
     *  base_price: number
     *
     * @param data
     * @returns {Promise<ItemPrice>}
     */
    public get(data: ItemPriceMessage): Promise<ItemPrice> {
        return {
            currency: data.currency,
            basePrice: data.basePrice
        } as any;
    }
}
