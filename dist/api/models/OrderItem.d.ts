import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { Order } from './Order';
import { Bid } from './Bid';
import { OrderItemObject } from './OrderItemObject';
export declare class OrderItem extends Bookshelf.Model<OrderItem> {
    static RELATIONS: string[];
    static fetchById(value: number, withRelated?: boolean): Promise<OrderItem>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Status: string;
    ItemHash: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    Order(): Order;
    Bid(): Bid;
    OrderItemObjects(): Collection<OrderItemObject>;
}
