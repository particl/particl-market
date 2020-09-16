// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:max-classes-per-file
import * as _ from 'lodash';
import * as resources from 'resources';
import { MissingParamException } from '../exceptions/MissingParamException';
import { InvalidParamException } from '../exceptions/InvalidParamException';
import { BidDataValue } from '../enums/BidDataValue';
import { EscrowReleaseType, EscrowType, SaleType } from 'omp-lib/dist/interfaces/omp-enums';
import { Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { ModelServiceInterface } from '../services/ModelServiceInterface';
import { ModelNotFoundException } from '../exceptions/ModelNotFoundException';
import { CommentType } from '../enums/CommentType';
import { EnumHelper } from '../../core/helpers/EnumHelper';
import { OrderItemStatus } from '../enums/OrderItemStatus';
import {SearchOrder} from '../enums/SearchOrder';

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

    constructor(name: string, required: boolean = false) {
        this.name = name;
        this.required = required;
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

export class BaseEnumValidationRule extends BaseParamValidationRule {
    public type = 'string';
    public validEnumType: string;
    public validEnumValues: string[];

    constructor(name: string, required: boolean, validEnumType: string, validEnumValues: string[]) {
        super(name, required);
        this.validEnumType = validEnumType;
        this.validEnumValues = validEnumValues;
    }

    public async customValidate(value: any, index: number, allValues: any[]): Promise<boolean> {
        if (this.validEnumValues.indexOf(value) === -1) {
            return false;
        }
        return true;
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

    constructor(name: string, required: boolean = false) {
        super(name, required);
    }
}


// Numeric

export class PriceValidationRule extends BaseParamValidationRule {
    public type = 'number';
    public defaultValue = 0;

    constructor(name: string, required: boolean = false) {
        super(name, required);
    }

    public async customValidate(value: any, index: number, allValues: any[]): Promise<boolean> {
        if (!_.isNil(value)) {
            // why couldn't we sell free shit?
            return value >= 0;
        }
        return true;
    }
}

export class EscrowRatioValidationRule extends BaseParamValidationRule {
    public type = 'number';
    public defaultValue = 100;

    constructor(name: string, required: boolean = false) {
        super(name, required);
    }

    public async customValidate(value: any, index: number, allValues: any[]): Promise<boolean> {
        if (!_.isNil(value)) {
            return value >= 0;
        }
        return true;
    }
}


// Enums

export class SaleTypeValidationRule extends BaseEnumValidationRule {
    public defaultValue = SaleType.SALE;

    constructor(required: boolean = false) {
        super('saleType', required, 'SaleType', [SaleType.SALE]);
    }
}

export class CryptocurrencyValidationRule extends BaseEnumValidationRule {
    public defaultValue = Cryptocurrency.PART;

    constructor(required: boolean = false) {
        super('currency', required, 'Cryptocurrency', [Cryptocurrency.PART]);
    }
}

export class EscrowTypeValidationRule extends BaseEnumValidationRule {
    public defaultValue = EscrowType.MAD_CT;

    constructor(required: boolean = false) {
        super('escrowType', required, 'EscrowType', [EscrowType.MAD_CT, EscrowType.MULTISIG]);
    }
}

export class EscrowReleaseTypeValidationRule extends BaseEnumValidationRule {
    public defaultValue = EscrowReleaseType.ANON;

    constructor(required: boolean = false) {
        super('escrowReleaseType', required, 'EscrowReleaseType', [EscrowReleaseType.ANON, EscrowReleaseType.BLIND]);
    }
}

export class OrderItemStatusValidationRule extends BaseEnumValidationRule {
    constructor(required: boolean = false) {
        super('orderItemStatus', required, 'OrderItemStatus', EnumHelper.getValues(OrderItemStatus) as string[]);
    }
}

export class CommentTypeValidationRule extends BaseEnumValidationRule {
    constructor(required: boolean = false) {
        super('commentType', required, 'CommentType', EnumHelper.getValues(CommentType) as string[]);
    }
}


// boolean

export class BooleanValidationRule extends BaseParamValidationRule {
    public type = 'boolean';

    constructor(name: string, required: boolean = false) {
        super(name, required);
    }
}


// search

export class SearchPageValidationRule extends BaseParamValidationRule {
    public type = 'number';
    public defaultValue = 0;

    constructor() {
        super('page', true);
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
    public defaultValue = 10;

    constructor() {
        super('pageLimit', true);
    }

    public async customValidate(value: any, index: number, allValues: any[]): Promise<boolean> {
        if (!_.isNil(value)) {
            return value > 0;
        }
        return true;
    }
}

export class SearchOrderValidationRule extends BaseEnumValidationRule {
    constructor() {
        super('order', true, 'SearchOrder', EnumHelper.getValues(SearchOrder) as string[]);
    }
}

export class SearchOrderFieldValidationRule extends BaseEnumValidationRule {
    constructor(allowedSearchOrderFields: string[]) {
        super('orderField', true, 'SearchOrderField', allowedSearchOrderFields);
    }
}

// tslint:enable:max-classes-per-file
