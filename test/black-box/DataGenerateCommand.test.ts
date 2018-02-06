import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('DataGenerateCommand', () => {

  const testUtil = new BlackBoxTestUtil();
  const method =  Commands.DATA_ROOT.commandName;
  const subCommand =  Commands.DATA_GENERATE.commandName;

  beforeAll(async () => {
      await testUtil.cleanDb();
  });

  const modelName = 'profile';
  const withRelated = true;

  test('Should generate one profile by RPC', async () => {
    const res = await rpc(method, [subCommand, modelName, 1, withRelated]);
    res.expectJson();
    res.expectStatusCode(200);
    const result: any = res.getBody()['result'];
    expect(result[0].name).not.toBeUndefined();
    expect(result[0].address).not.toBeUndefined();
  });

  test('Should generate two profile by RPC', async () => {
    const res = await rpc(method, [subCommand, modelName, 2, withRelated]);
    res.expectJson();
    res.expectStatusCode(200);
    const result: any = res.getBody()['result'];
    expect(result).toHaveLength(2);
  });

});
