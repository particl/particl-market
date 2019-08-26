// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE


export class EnumHelper {

    public static containsName(e: any, name: string): boolean {
        return EnumHelper.getNames(e).indexOf(name) !== -1;
    }

    public static containsValue(e: any, value: string): boolean {
        return EnumHelper.getValues(e).indexOf(value) !== -1;
    }

    public static getNamesAndValues<T extends number>(e: any): any[] {
        return EnumHelper.getNames(e).map(n => ({ name: n, value: e[n] as T }));
    }

    public static getNames(e: any): string[] {
        if (EnumHelper.isNumeric(e)) {
            return EnumHelper.getObjValues(e).filter(v => typeof v === 'string') as string[];
        } else {
            return EnumHelper.getObjKeys(e) as string[];
        }
    }

    public static getValues<T extends number>(e: any): Array<number | string> {
        if (EnumHelper.isNumeric(e)) {
            return EnumHelper.getObjValues(e).filter(v => typeof v === 'number');
        } else {
            return EnumHelper.getObjValues(e).filter(v => typeof v === 'string');
        }
    }

    public static isNumeric(e: any): boolean {
        return EnumHelper.getObjValues(e).filter(v => typeof v === 'number').length > 0;
    }

    private static getObjValues(e: any): Array<number | string> {
        return Object.keys(e).map(k => e[k]);
    }

    private static getObjKeys(e: any): string[] {
        return Object.keys(e);
    }


}
