import * as crypto from 'crypto-js';

export class ObjectHash {
    public static getHash(obj: any): string {
        return crypto.SHA256(JSON.stringify(obj)).toString();
    }
}
