import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('/EscrowDestroyCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ESCROW_ROOT.commandName;
    const subCommand = Commands.ESCROW_REMOVE.commandName;

    let profileId;
    let createdTemplateId;
    const testDataListingItemTemplate = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates',
            shortDescription: 'Item short description with Templates',
            longDescription: 'Item long description with Templates',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            }
        },
        paymentInformation: {
            type: PaymentType.SALE,
            escrow: {
                type: EscrowType.MAD,
                ratio: {
                    buyer: 100,
                    seller: 100
                }
            },
            itemPrice: {
                currency: Currency.BITCOIN,
                basePrice: 0.0001,
                shippingPrice: {
                    domestic: 0.123,
                    international: 1.234
                },
                cryptocurrencyAddress: {
                    type: CryptocurrencyAddressType.NORMAL,
                    address: 'This is temp address.'
                }
            }
        }
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        profileId = defaultProfile.id;
    });

    test('Should destroy Escrow by RPC', async () => {
        testDataListingItemTemplate.profile_id = profileId;

        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);

        addListingItemTempRes.expectJson();
        addListingItemTempRes.expectStatusCode(200);
        const addListingItemTempResult = addListingItemTempRes.getBody()['result'];
        createdTemplateId = addListingItemTempResult.id;

        const destroyDataRes: any = await rpc(method, [subCommand, createdTemplateId]);
        destroyDataRes.expectJson();
        destroyDataRes.expectStatusCode(200);
    });

    test('Should fail destroy Escrow because already been destroyed', async () => {
        const destroyDataRes: any = await rpc(method, [subCommand, createdTemplateId]);
        destroyDataRes.expectJson();
        destroyDataRes.expectStatusCode(404);
    });
});
