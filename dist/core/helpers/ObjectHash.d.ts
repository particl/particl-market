import { HashableObjectType } from '../../api/enums/HashableObjectType';
export declare class ObjectHash {
    /**
     *
     * @param objectToHash
     * @param {HashableObjectType} type
     * @returns {string}
     */
    static getHash(objectToHash: any, type: HashableObjectType, timestampedHash?: boolean): string;
}
