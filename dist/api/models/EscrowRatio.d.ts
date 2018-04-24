import { Bookshelf } from '../../config/Database';
export declare class EscrowRatio extends Bookshelf.Model<EscrowRatio> {
    static fetchById(value: number, withRelated?: boolean): Promise<EscrowRatio>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Buyer: number;
    Seller: number;
    UpdatedAt: Date;
    CreatedAt: Date;
}
