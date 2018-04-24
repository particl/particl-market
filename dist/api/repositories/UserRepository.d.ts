/**
 * UserRepository
 * ------------------------------
 */
import * as Bookshelf from 'bookshelf';
import { User } from '../models/User';
export declare class UserRepository {
    UserModel: typeof User;
    constructor(UserModel: typeof User);
    /**
     * Retrieves all user data out of the database
     *
     * @static
     * @returns {Promise<Bookshelf.Collection<User>>}
     *
     * @memberof UserRepository
     */
    findAll(): Promise<Bookshelf.Collection<User>>;
    /**
     * Retrieves one user entity of the database
     *
     * @static
     * @param {number} id of the user
     * @returns {Promise<User>}
     */
    findOne(id: number): Promise<User>;
    /**
     * Retrieves one user entity of the database
     *
     * @static
     * @param {number} id of the user
     * @returns {Promise<User>}
     */
    findByUserId(userId: string): Promise<User>;
    /**
     * Creates a new user entity in the database and returns
     * the new created entity
     *
     * @static
     * @param {*} data is the new user
     * @returns {Promise<User>}
     */
    create(data: any): Promise<User>;
    /**
     * Updates a already existing entity and returns the new one
     *
     * @static
     * @param {number} id
     * @param {*} data
     * @returns {Promise<User>}
     */
    update(id: number, data: any): Promise<User>;
    /**
     * Removes a entity in the database, but if there is not user
     * with the given id, we will throw a Not-Found exception
     *
     * @static
     * @param {number} id
     * @returns {Promise<void>}
     */
    destroy(id: number): Promise<void>;
}
