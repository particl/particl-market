
export class EnumHelper {

    public static containsName(e: any, name: string): boolean {
        return EnumHelper.getNames(e).indexOf(name) !== -1;
    }

    public static getNamesAndValues<T extends number>(e: any): any[] {
        return EnumHelper.getNames(e).map(n => ({ name: n, value: e[n] as T }));
    }

    public static getNames(e: any): string[] {
        return EnumHelper.getObjValues(e).filter(v => typeof v === 'string') as string[];
    }

    public static getValues<T extends number>(e: any): T[] {
        return EnumHelper.getObjValues(e).filter(v => typeof v === 'number') as T[];
    }

    private static getObjValues(e: any): Array<number | string> {
        return Object.keys(e).map(k => e[k]);
    }
}
