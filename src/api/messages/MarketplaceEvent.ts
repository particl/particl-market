import { SmsgMessage } from './SmsgMessage';
import { MarketplaceMessage } from './MarketplaceMessage';

export class MarketplaceEvent {
    public smsgMessage: SmsgMessage;
    public marketplaceMessage: MarketplaceMessage;
}
