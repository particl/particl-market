import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import * as _ from 'lodash';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemPrice } from '../models/ItemPrice';
import { Currency } from '../enums/Currency';

export class ItemPriceFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public get(data: any): Promise<ItemPrice> {
        const ItemPriceData = _.map(data, (value) => {
            return _.assign({}, {
                currency: Currency[value['currency']],
                basePrice: value['base_price']
            });
        });
        return ItemPriceData as any;
    }
}
