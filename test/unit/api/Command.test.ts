
import { CommandEnumType } from '../../../src/api/commands/CommandEnumType';
import { Command } from '../../../src/api/commands/Command';

describe('Command', () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const Commands: CommandEnumType = new CommandEnumType();

    beforeEach(() => {
        //
    });

    test('Should return correct name, type, isRoot and parent', async () => {

        expect(Commands.MARKET).toBeInstanceOf(Command);
        expect(Commands.MARKET.toString()).toBe('Command.MARKET');
        expect(Commands.MARKET.propName).toBe('MARKET');
        expect(Commands.MARKET.description).toBe('market');
        expect(Commands.MARKET.commandName).toBe('market');
        expect(Commands.MARKET.isRoot).toBe(true);
        expect(Commands.MARKET.childCommands).toHaveLength(2);
        expect(Commands.MARKET.childCommands.sort()).toEqual([Commands.MARKET_ADD, Commands.MARKET_LIST].sort());
        expect(Commands.MARKET_ADD.description).toBe('marketadd');
        expect(Commands.MARKET_ADD.commandName).toBe('add');
        expect(Commands.MARKET_ADD.isRoot).toBe(false);
        expect(Commands.MARKET_LIST.description).toBe('marketlist');
        expect(Commands.MARKET_LIST.commandName).toBe('list');
        expect(Commands.MARKET_LIST.isRoot).toBe(false);
        expect(Commands.values).toHaveLength(82);
        expect(Commands.getRootCommands()).toHaveLength(12);

    });

});
