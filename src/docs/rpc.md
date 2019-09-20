# RPC API

By default the Marketplace RPC endpoint can be found at `/api/rpc`.

## Making a Request

An rpc call is made by creating and sending a POST request to the Servers RPC endpoint url.

All requests follow the standard JSON-RPC 2.0 request object format:


### Parameters
> Example Request:
```json
{
  "jsonrpc": "2.0",
  "method": "profile",
  "params": ["list"],
  "id" : 1
}
```

Parameter | Type | Description
--------- | ----------- | -----------
jsonrpc | string | Version of the JSON-RPC protocol. MUST be exactly "2.0".
method | string | Name of the method to be called.
params | any[] | Parameters for the method to be called.
id | number \| string | Request identifier

## Commands

The Request objects method-field and the first param of the params-field define the Command being called. The rest of the 
params are passed on as arguments to the Command. 

Implementations of all the Commands are found in [src/api/commands](https://github.com/particl/particl-market/tree/develop/src/api/commands).

### Marketplace CLI

Marketplace has its own web based cli, which can be used to quickly execute some commands. It can be found at `/cli`.


