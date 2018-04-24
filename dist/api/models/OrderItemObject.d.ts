import { Bookshelf } from '../../config/Database';
import { OrderItem } from './OrderItem';
export declare class OrderItemObject extends Bookshelf.Model<OrderItemObject> {
    static RELATIONS: string[];
    static fetchById(value: number, withRelated?: boolean): Promise<OrderItemObject>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    DataId: string;
    DataValue: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    OrderItem(): OrderItem;
}
