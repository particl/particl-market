
export function getOsEnv(key: string): string {
    if (typeof process.env[key] === 'undefined') {
        throw new Error(`Environment variable ${key} is not set.`);
    }
    return process.env[key] as string;
}

export function getOsEnvOptional(key: string): string | undefined {
    return process.env[key];
}

export function getOsEnvArray(key: string, delimiter: string = ','): string[] {
    return process.env[key] && process.env[key].split(delimiter) || [];
}

export function toNumber(value: string): number {
    return parseInt(value, 10);
}

export function toFloat(value: string): number {
    return parseFloat(value);
}

export function toBool(value: string): boolean {
    return value === 'true';
}

export function clone(original: any): any {
    return JSON.parse(JSON.stringify(original));
}
/*
export function toBigNumber(value: number): BigNumber {
    const BN = BigNumber.clone({
        DECIMAL_PLACES: 10,
        ROUNDING_MODE: BigNumber.ROUND_DOWN
    });
    return new BN(value, 10);
}

export function bnToNumber(value: BigNumber): number {
    return value.decimalPlaces(8, BigNumber.ROUND_DOWN).toNumber();
}

export function bnToString(value: BigNumber): string {
    return value.toFixed(8, BigNumber.ROUND_DOWN);
}
*/
