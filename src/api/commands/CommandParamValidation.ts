// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:max-classes-per-file
import * as _ from 'lodash';
import * as resources from 'resources';
import { MissingParamException } from '../exceptions/MissingParamException';
import { InvalidParamException } from '../exceptions/InvalidParamException';
import { BidDataValue } from '../enums/BidDataValue';
import { MPAction, SaleType } from 'omp-lib/dist/interfaces/omp-enums';
import { Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { ModelServiceInterface } from '../services/ModelServiceInterface';
import { ModelNotFoundException } from '../exceptions/ModelNotFoundException';
import { EnumHelper } from '../../core/helpers/EnumHelper';
import { SearchOrder } from '../enums/SearchOrder';
import { OrderItemStatus } from '../enums/OrderItemStatus';
import { OrderStatus } from '../enums/OrderStatus';
import { MPActionExtended } from '../enums/MPActionExtended';
import { MessageException } from '../exceptions/MessageException';
import { GovernanceAction } from '../enums/GovernanceAction';
import { CommentAction } from '../enums/CommentAction';

/**
 * used as custom validation function for params.
 * return boolean or throw as a result.
 * returning anything other than boolean value replaces the original value.
 */
export type ValidationFunction = (value: any, index: number, allValues: any[]) => Promise<any>;

/**
 * collection of rules used to validate the command parameters.
 * todo: add target command
 */
export interface CommandParamValidationRules {
    params: ParamValidationRule[];
}

/**
 * name: parameter name
 * required: whether the param is required or optional
 * type: param typeof, optional and anything goes if not set
 * defaultValue: default value set to undefined values, set before validation
 * customValidate: optional function to do some custom validations for the value
 */
export interface ParamValidationRule {
    name: string;
    required: boolean;
    type?: string;
    defaultValue?: any;
    customValidate: ValidationFunction;
}

export abstract class BaseParamValidationRule implements ParamValidationRule {

    public name: string;
    public required: boolean;
    public type?: string;
    public defaultValue?: any;

    constructor(name: string, required: boolean = false, defaultValue?: any) {
        this.name = name;
        this.required = required;
        this.defaultValue = defaultValue;
    }

    public async customValidate(value: any, index: number, allValues: any[]): Promise<boolean> {
        return true;
    }
}

/**
 * modelService: modelService used to fetch the related data, will replace the value if set
 */
export class IdValidationRule extends BaseParamValidationRule {
    public type = 'number';
    public modelService?: ModelServiceInterface<any>;

    constructor(name: string, required: boolean = false, modelService?: ModelServiceInterface<any>) {
        super(name, required);
        this.name = name;
        this.modelService = modelService;
    }

    public async customValidate(value: number, index: number, allValues: any[]): Promise<any> {
        let result = true;
        if ((!_.isNil(value) || this.required) && value < 0) {
            throw new InvalidParamException(this.name, 'value < 0');
        }

        // if modelService is set, make sure we can find something with the id and return that
        if (!_.isNil(value) && this.modelService) {
            result = await this.modelService.findOne(value, true)
                .then(model => model.toJSON())
                .catch(reason => {
                    const modelName = this.name.charAt(0).toUpperCase() + this.name.slice(1, -2);
                    throw new ModelNotFoundException(modelName);
                });
        }
        return result;
    }
}


// Misc

export class AddressOrAddressIdValidationRule extends BaseParamValidationRule {

    public type = undefined;

    private MPA_BID_REQUIRED_ADDRESS_KEYS: string[] = [
        BidDataValue.SHIPPING_ADDRESS_FIRST_NAME.toString(),
        BidDataValue.SHIPPING_ADDRESS_LAST_NAME.toString(),
        BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1.toString(),
        BidDataValue.SHIPPING_ADDRESS_CITY.toString(),
        BidDataValue.SHIPPING_ADDRESS_STATE.toString(),
        BidDataValue.SHIPPING_ADDRESS_ZIP_CODE.toString(),
        BidDataValue.SHIPPING_ADDRESS_COUNTRY.toString()
    ];

    constructor(required: boolean = false) {
        super('address|addressId', required);
    }

    public async customValidate(value: any, index: number, allValues: any[]): Promise<boolean> {
        if (typeof value === 'boolean' && value === false) {
            // make sure that required keys are there
            for (const addressKey of this.MPA_BID_REQUIRED_ADDRESS_KEYS) {
                if (!_.includes(allValues, addressKey.toString()) ) {
                    throw new MissingParamException(addressKey);
                }
            }
        } else if (typeof value !== 'number') {
            // anything other than number should fail then
            throw new InvalidParamException('address', 'false|number');
        }
        return true;
    }
}


// Strings

export class StringValidationRule extends BaseParamValidationRule {
    public type = 'string';

    constructor(name: string, required: boolean = false, defaultValue?: string) {
        super(name, required, defaultValue);
    }
}

export class NumberOrStringValidationRule extends BaseParamValidationRule {
    public type = undefined;

    constructor(name: string, required: boolean = false, defaultValue?: string) {
        super(name, required, defaultValue);
    }

    public async customValidate(value: number, index: number, allValues: any[]): Promise<boolean> {
        if (!_.isNumber(value) && !_.isString(value)) {
            throw new InvalidParamException(this.name, 'number|string');
        }
        return true;
    }
}


export class NumberOrAsteriskValidationRule extends BaseParamValidationRule {
    public type = undefined;

    constructor(name: string, required: boolean = false, defaultValue?: number | string) {
        super(name, required, defaultValue);
    }

    public async customValidate(value: any, index: number, allValues: any[]): Promise<any> {
        if (!_.isNil(value) && !_.isNumber(value) && value !== '*') {
            throw new InvalidParamException(this.name, 'number|*');
        }

        if (!_.isNil(value) && !_.isFinite(value) && value < 0) {
            throw new InvalidParamException(this.name);
        }
        value = (value === '*') ? undefined : value;
        return value;
    }
}


// Numeric

export class NumberValidationRule extends BaseParamValidationRule {
    public type = 'number';

    constructor(name: string, required: boolean = false, defaultValue?: number) {
        super(name, required, defaultValue);
    }

    public async customValidate(value: number, index: number, allValues: any[]): Promise<boolean> {
        if (!_.isNil(value)) {
            if (value < 0) {
                throw new InvalidParamException('age', 'greater than 0');
            }
            return true;
        }
        return false;
    }
}

export class MessageRetentionValidationRule extends NumberValidationRule {
    constructor(name: string, required: boolean = false) {
        super(name, required);
    }

    public async customValidate(value: number, index: number, allValues: any[]): Promise<boolean> {
        if (value <= 0) {
            throw new InvalidParamException(this.name, 'larger than 0');
        }
        if (value > parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10)) {
            throw new InvalidParamException(this.name, 'smaller than ' + process.env.PAID_MESSAGE_RETENTION_DAYS);
        }

        return value > 0 && value <= parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10);
    }
}

export class ScalingValueValidationRule extends NumberValidationRule {
    constructor(name: string, required: boolean = false, defaultValue?: any) {
        super(name, required, defaultValue);
    }

    public async customValidate(value: number, index: number, allValues: any[]): Promise<boolean> {
        if (!_.isNil(value)) {
            return value >= 0 && value <= 1;
        }
        return true;
    }
}

export class PriceValidationRule extends NumberValidationRule {
    constructor(name: string, required: boolean = false) {
        super(name, required, 0);
    }
}

export class EscrowRatioValidationRule extends NumberValidationRule {
    constructor(name: string, required: boolean = false, defaultValue?: number) {
        super(name, required, defaultValue ? defaultValue : 100);
    }
}


// Enums

export class EnumValidationRule extends BaseParamValidationRule {
    public type?: string;
    public validEnumType: string;
    public validEnumValues: string[];

    constructor(name: string, required: boolean, validEnumType: string, validEnumValues: string[], defaultValue?: any) {
        super(name, required, defaultValue);
        this.type = 'string';
        this.validEnumType = validEnumType;
        this.validEnumValues = validEnumValues;
    }

    public async customValidate(value: string, index: number, allValues: string[]): Promise<boolean> {
        if (!_.isNil(value) && this.validEnumValues.indexOf(value) === -1) {
            return false;
        }
        return true;
    }
}

export class OrderStatusOrOrderItemStatusValidationRule extends EnumValidationRule {
    constructor(required: boolean = false) {
        super('status', required, 'OrderStatus|OrderItemStatus',
            (EnumHelper.getValues(OrderStatus) as string[]).concat(EnumHelper.getValues(OrderItemStatus) as string[]));
    }
}

export class MPActionAndExtendedMessageValidationRule extends EnumValidationRule {
    constructor(required: boolean = false) {
        super('type', required, 'MPAction|MPActionExtended',
            (EnumHelper.getValues(MPAction) as string[]).concat(EnumHelper.getValues(MPActionExtended) as string[]));
    }
}

export class ActionMessageTypesValidationRule extends EnumValidationRule {
    public type = undefined;

    constructor(required: boolean = false) {
        super('types', required, 'ActionMessages',
            (EnumHelper.getValues(MPAction) as string[])
                .concat(EnumHelper.getValues(MPActionExtended) as string[])
                .concat(EnumHelper.getValues(GovernanceAction) as string[])
                .concat(EnumHelper.getValues(CommentAction) as string[])
        );
    }

    public async customValidate(value: any, index: number, allValues: string[]): Promise<boolean> {
        if (!_.isNil(value)
            && (!Array.isArray(value)
                || value.every(type => {
                    return typeof type !== 'string' || this.validEnumValues.indexOf(type) === -1;
                })
            )) {
            throw new InvalidParamException('types', 'ActionMessageTypes[]');
        }
        return true;
    }
}

export class SaleTypeValidationRule extends EnumValidationRule {
    public defaultValue = SaleType.SALE;

    constructor(required: boolean = false) {
        super('saleType', required, 'SaleType', [SaleType.SALE] as string[]);
    }
}

export class CryptocurrencyValidationRule extends EnumValidationRule {
    public defaultValue = Cryptocurrency.PART;

    constructor(required: boolean = false) {
        super('currency', required, 'Cryptocurrency', [Cryptocurrency.PART] as string[]);
    }
}


// boolean

export class BooleanValidationRule extends BaseParamValidationRule {
    public type = 'boolean';

    constructor(name: string, required: boolean = false, defaultValue?: boolean) {
        super(name, required, defaultValue);
    }
}


// search

export class SearchPageValidationRule extends BaseParamValidationRule {
    public type = 'number';

    constructor() {
        super('page', true, 0);
    }

    public async customValidate(value: any, index: number, allValues: any[]): Promise<boolean> {
        if (!_.isNil(value)) {
            return value >= 0;
        }
        return true;
    }
}

export class SearchPageLimitValidationRule extends BaseParamValidationRule {
    public type = 'number';

    constructor() {
        super('pageLimit', true, 10);
    }

    public async customValidate(value: any, index: number, allValues: any[]): Promise<boolean> {
        if (!_.isNil(value)) {
            return value > 0;
        }
        return true;
    }
}

export class SearchOrderValidationRule extends EnumValidationRule {
    constructor() {
        super('order', true, 'SearchOrder', EnumHelper.getValues(SearchOrder) as string[]);
    }
}

export class SearchOrderFieldValidationRule extends EnumValidationRule {
    constructor(allowedSearchOrderFields: string[]) {
        super('orderField', true, 'SearchOrderField', allowedSearchOrderFields);
    }
}

// tslint:enable:max-classes-per-file
