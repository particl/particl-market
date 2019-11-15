

## Templates

Commands for managing ListingItemTemplates.

### template post

```
template post <profileId> [TODO]
```
<aside class="notice">
since: 0.1.0
</aside>

[ListingItemTemplatePostCommand.ts](https://github.com/particl/particl-market/tree/develop/src/api/commands/listingitemtemplate/ListingItemTemplatePostCommand.ts)

TODO description.

#### Request
> Example Request 
```json
{
  "jsonrpc": "2.0",
  "method": "template",
  "params": ["post", 3, TODO],
  "id" : 1
}
```

Parameter       | Type      | Required | Description
--------------- | --------- | -------- | -----------
profileId       | number    | *        | 
name            | string    | *        | 
type            | string    |          | 
receiveKey      | string    |          | 
receiveAddress  | string    |          | 
publishKey      | string    |          | 
publishAddress  | string    |          | 
walletId        | number    |          | 


#### Response

> Example Response
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "id": 4,
    "name": "second market",
    "type": "MARKETPLACE",
    "receiveKey": "7ukyVggjdfgXTa7rjcWRvymMGDezXtAF3YMMePXKb5wfR8KvaqaX",
    "receiveAddress": "pf6YKaJgX8YKHepMXPKNk1bxDp2FB5wtpx",
    "publishKey": "7ukyVggjdfgXTa7rjcWRvymMGDezXtAF3YMMePXKb5wfR8KvaqaX",
    "publishAddress": "pf6YKaJgX8YKHepMXPKNk1bxDp2FB5wtpx",
    "updatedAt": 1563626078910,
    "createdAt": 1563626078910,
    "profileId": 3,
    "walletId": 3,
    "Profile": {
      "id": 3,
      "name": "DEFAULT",
      "address": "pX4hZ22DWTurdMZy4cus6Ag6ES1T4SP3JK",
      "updatedAt": 1563622517479,
      "createdAt": 1563622517479
    },
    "Wallet": {
      "id": 3,
      "name": "market.dat",
      "profileId": 3,
      "updatedAt": 1563622517523,
      "createdAt": 1563622517523
    }
  }
}
```

[Models/ListingItemTemplate](#listingitemtemplate)



