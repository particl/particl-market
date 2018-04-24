import { Bookshelf } from '../../config/Database';
export declare class PriceTicker extends Bookshelf.Model<PriceTicker> {
    static fetchById(value: number, withRelated?: boolean): Promise<PriceTicker>;
    static getOneBySymbol(currency: string): Promise<PriceTicker>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    UpdatedAt: Date;
    CreatedAt: Date;
    CryptoId: string;
    CryptoName: string;
    CryptoSymbol: string;
    CryptoRank: string;
    CryptoPriceUsd: string;
    CryptoPriceBtc: string;
    Crypto24HVolumeUsd: string;
    CryptoMarketCapUsd: string;
    CryptoAvailableSupply: string;
    CryptoTotalSupply: string;
    CryptoMaxSupply: string;
    CryptoPercentChange1H: string;
    CryptoPercentChange24H: string;
    CryptoPercentChange7D: string;
    CryptoLastUpdated: string;
    CryptoPriceEur: string;
    Crypto24HVolumeEur: string;
    CryptoMarketCapEur: string;
}
