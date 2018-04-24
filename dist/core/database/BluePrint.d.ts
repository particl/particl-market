/**
 * core.database.BluePrint
 * ------------------------------------------------
 */
import * as bookshelf from 'bookshelf';
export declare class BluePrint {
    Model: typeof bookshelf.Model;
    callback: (faker: Faker.FakerStatic, args: any[]) => any;
    constructor(Model: typeof bookshelf.Model, callback: (faker: Faker.FakerStatic, args: any[]) => any);
}
