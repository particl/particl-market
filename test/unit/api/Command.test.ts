import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Command } from '../../../src/api/commands/Command';

describe('Command', () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    // const Commands: CommandEnumType = new CommandEnumType();

    beforeEach(() => {
        //
    });

    test('Should return correct instance for Command', async () => {
        expect(Commands.MARKET_ROOT).toBeInstanceOf(Command);
    });

    test('Should return correct toString for Command', async () => {
        expect(Commands.MARKET_ROOT.toString()).toBe('Command.MARKET_ROOT');
        expect(Commands.MARKET_ADD.toString()).toBe('Command.MARKET_ADD');
        expect(Commands.MARKET_LIST.toString()).toBe('Command.MARKET_LIST');
    });

    test('Should return correct propName, description, commandName and isRoot for Command', async () => {
        expect(Commands.MARKET_ROOT.propName).toBe('MARKET_ROOT');
        expect(Commands.MARKET_ROOT.description).toBe('market');
        expect(Commands.MARKET_ROOT.commandName).toBe('market');
        expect(Commands.MARKET_ROOT.isRoot).toBe(true);
        expect(Commands.MARKET_ADD.propName).toBe('MARKET_ADD');
        expect(Commands.MARKET_ADD.description).toBe('marketadd');
        expect(Commands.MARKET_ADD.commandName).toBe('add');
        expect(Commands.MARKET_ADD.isRoot).toBe(false);
        expect(Commands.MARKET_LIST.propName).toBe('MARKET_LIST');
        expect(Commands.MARKET_LIST.description).toBe('marketlist');
        expect(Commands.MARKET_LIST.commandName).toBe('list');
        expect(Commands.MARKET_LIST.isRoot).toBe(false);
    });

    test('Should return correct childCommands for Command', async () => {
        expect(Commands.MARKET_ROOT.childCommands).toHaveLength(2);
        expect(Commands.MARKET_ROOT.childCommands.sort()).toEqual([Commands.MARKET_ADD, Commands.MARKET_LIST].sort());
    });

    test('Should return all types of Commands and all root Commands', async () => {
        expect(Commands.values).toHaveLength(77);
        expect(Commands.rootCommands).toHaveLength(19);
    });
});
