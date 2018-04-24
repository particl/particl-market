/**
 * core.database.ModelFactory
 * ------------------------------------------------
 */
import { BluePrint } from './BluePrint';
export declare class ModelFactory {
    private faker;
    private blueprint;
    private args;
    private identifier;
    private eachFn;
    constructor(faker: Faker.FakerStatic, blueprint: BluePrint, args: any[]);
    returning(identifier: string): ModelFactory;
    each(iterator: (obj: any) => Promise<any>): ModelFactory;
    create(amount?: number): Promise<any>;
    private build();
    private makeEntity(entity);
}
