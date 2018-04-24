import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { OrderItem } from './OrderItem';
import { Address } from './Address';
import { OrderSearchParams } from '../requests/OrderSearchParams';
export declare class Order extends Bookshelf.Model<Order> {
    static RELATIONS: string[];
    static fetchById(value: number, withRelated?: boolean): Promise<Order>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Hash: string;
    Buyer: string;
    Seller: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    static search(options: OrderSearchParams, withRelated?: boolean): Promise<Collection<Order>>;
    OrderItems(): Collection<OrderItem>;
    ShippingAddress(): Address;
}
