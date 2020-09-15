// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
/*
export type ValidationFunction = (value: any, index: number, allValues: any[]) => boolean;

export interface ParamValidationRule {
    name: string;
    required: boolean;
    type: string;
    defaultValue?: any;
    customValidate?: ValidationFunction;
}

export interface CommandParamValidationRules {
    params: ParamValidationRule[];
}
*/
// tslint:disable:max-classes-per-file
import * as _ from 'lodash';
import { MissingParamException } from '../exceptions/MissingParamException';
import { InvalidParamException } from '../exceptions/InvalidParamException';
import { BidDataValue } from '../enums/BidDataValue';


export type ValidationFunction = (value: any, index: number, allValues: any[]) => boolean;

export interface ParamValidationRule {
    name: string;
    required: boolean;
    type?: string;
    defaultValue: any;
    customValidate: ValidationFunction;
}

export interface CommandParamValidationRules {
    params: ParamValidationRule[];
}

export abstract class BaseParamValidationRule implements ParamValidationRule {

    public name: string;
    public required: boolean;
    public type?: string;
    public defaultValue = undefined;

    constructor(required: boolean = false) {
        this.required = required;
    }

    public customValidate(value: any, index: number, allValues: any[]): boolean {
        return true;
    }
}

export class ListingItemIdValidationRule extends BaseParamValidationRule {
    public name = 'listingItemId';
    public type = 'number';
}

export class IdentityIdValidationRule extends BaseParamValidationRule {
    public name = 'identityId';
    public type = 'number';
}

export class AddressOrAddressIdValidationRule extends BaseParamValidationRule {

    public name = 'address|addressId';
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

    public customValidate(value: any, index: number, allValues: any[]): boolean {
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


// tslint:enable:max-classes-per-file
