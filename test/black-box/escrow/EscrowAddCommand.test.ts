import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { EscrowType } from '../../../src/api/enums/EscrowType';
import { ListingItemTemplateCreateRequest } from '../../../src/api/requests/ListingItemTemplateCreateRequest';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';

describe('EscrowAddCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ESCROW_ROOT.commandName;
    const subCommand = Commands.ESCROW_ADD.commandName;
    let profileId;

    const testDataListingItemTemplate = {
        profile_id: 0,
        hash: '',
        paymentInformation: {
            type: PaymentType.SALE
        }
    } as ListingItemTemplateCreateRequest;

    const testData = {
        type: EscrowType.MAD,
        ratio: {
            buyer: 100,
            seller: 100
        }
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        profileId = defaultProfile.id;
    });

    test('Should Create new Escrow by RPC', async () => {
        // set profile
        testDataListingItemTemplate.profile_id = profileId;

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate);

        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);

        const addListingItemTempResult = addListingItemTempRes;
        const createdTemplateId = addListingItemTempResult.id;
        const paymentInformationId = addListingItemTempResult.PaymentInformation.id;
        const addDataRes: any = await rpc(method, [subCommand, createdTemplateId, testData.type, testData.ratio.buyer, testData.ratio.seller]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);

        const result: any = addDataRes.getBody()['result'];
        expect(result.paymentInformationId).toBe(paymentInformationId);
        expect(result.type).toBe(testData.type);
        expect(result.Ratio.buyer).toBe(testData.ratio.buyer);
        expect(result.Ratio.seller).toBe(testData.ratio.seller);
    });

    test('Should fail create Escrow, payment-information is not related with item-template', async () => {

        delete testDataListingItemTemplate.itemInformation;
        delete testDataListingItemTemplate.paymentInformation;

        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate);

        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const createdTemplateId = addListingItemTempRes.id;

        // create escrow
        const addDataRes: any = await rpc(method, [subCommand, createdTemplateId, testData.type, testData.ratio.buyer, testData.ratio.seller]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
    });
});
