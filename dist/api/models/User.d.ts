/**
 * User Model
 * ------------------------------
 */
import { Bookshelf } from '../../config/Database';
export declare class User extends Bookshelf.Model<User> {
    static fetchById(id: number): Promise<User>;
    static fetchByUserId(userId: string): Promise<User>;
    /**
     * Configurations
     */
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    /**
     * Properties
     */
    Id: number;
    FirstName: string;
    LastName: string;
    Email: string;
    Picture: string;
    Auth0UserId: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    /**
     * Helper methods
     */
    fullName(): string;
}
