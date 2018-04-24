/// <reference types="node" />
/**
 * UserService
 * ------------------------------
 *
 * This service is here to validate and call the repository layer for
 * database actions. Furthermore you should throw events here if
 * necessary.
 */
import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { EventEmitter } from '../../core/api/events';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../models/User';
export declare class UserService {
    userRepo: UserRepository;
    Logger: typeof LoggerType;
    events: EventEmitter;
    private log;
    constructor(userRepo: UserRepository, Logger: typeof LoggerType, events: EventEmitter);
    /**
     * This returns all user database objects
     */
    findAll(): Promise<Bookshelf.Collection<User>>;
    /**
     * Returns the user with the given id or throws a Not-Found exception
     *
     * @param {number} id of the user
     * @returns {Promise<User>}
     */
    findOne(id: number): Promise<User>;
    /**
     * Returns the user with the given user_id or throws a Not-Found exception
     *
     * @param {number} id of the user
     * @returns {Promise<User>}
     */
    findByUserId(userId: string): Promise<User>;
    /**
     * We will validate the data and create a new user and
     * return it, so the client get its new id
     *
     * @param {*} data is the json body of the request
     * @returns {Promise<User>}
     */
    create(data: any): Promise<User>;
    /**
     * We will validate the data and update a user with the given id and
     * return the new user
     *
     * @param {number} id of the user
     * @param {*} newUser is the json body of the request
     * @returns {Promise<User>}
     */
    update(id: number, newUser: any): Promise<User>;
    /**
     * This will just delete a user
     *
     * @param {number} id of the user
     * @returns {Promise<void>}
     */
    destroy(id: number): Promise<void>;
}
