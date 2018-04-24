import { Bookshelf } from '../../config/Database';
import { Escrow } from './Escrow';
import { ItemPrice } from './ItemPrice';
export declare class PaymentInformation extends Bookshelf.Model<PaymentInformation> {
    static fetchById(value: number, withRelated?: boolean): Promise<PaymentInformation>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Type: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    Escrow(): Escrow;
    ItemPrice(): ItemPrice;
}
