import { ModelFactory } from './ModelFactory';
export declare class Factory {
    private faker;
    static getInstance(): Factory;
    private static instance;
    private blueprints;
    constructor(faker: Faker.FakerStatic);
    define(ModelStatic: any, callback: (faker: Faker.FakerStatic, args: any[]) => any): void;
    get(ModelStatic: any, ...args: any[]): ModelFactory;
    private getNameOfModel(Model);
}
