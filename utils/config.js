const dotenv = require('dotenv').config();
const bs58 = require('bs58');
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TOKEN = exports.addLookupTableInfo = exports.makeTxVersion = exports.RAYDIUM_MAINNET_API = exports.ENDPOINT = exports.PROGRAMIDS = exports.connection = exports.wallet = exports.rpcToken = exports.rpcUrl = void 0;
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const web3_js_1 = require("@solana/web3.js");
exports.walletAddress = process.env.PUBLIC_KEY;
exports.wallet = web3_js_1.Keypair.fromSecretKey(bs58.default.decode(process.env.PRIVATE_KEY));
exports.wallet2 = web3_js_1.Keypair.fromSecretKey(bs58.default.decode(process.env.PRIVATE_KEY_2)); // remove this before pushing
exports.connection = new web3_js_1.Connection(process.env.RPC_URL_2);
exports.websocketconnection = process.env.WS_URL;
exports.PROGRAMIDS = raydium_sdk_1.MAINNET_PROGRAM_ID;
exports.ENDPOINT = raydium_sdk_1.ENDPOINT;
exports.RAYDIUM_MAINNET_API = raydium_sdk_1.RAYDIUM_MAINNET;
exports.makeTxVersion = raydium_sdk_1.TxVersion.V0; // other ---> V0
exports.addLookupTableInfo = raydium_sdk_1.LOOKUP_TABLE_CACHE; // only mainnet. other = undefined
exports.DEFAULT_TOKEN = {
    'SOL': new raydium_sdk_1.Currency(9, 'USDC', 'USDC'),
    'WSOL': new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, new web3_js_1.PublicKey('So11111111111111111111111111111111111111112'), 9, 'WSOL', 'WSOL'),
    'USDC': new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, new web3_js_1.PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), 6, 'USDC', 'USDC'),
    'RAY': new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, new web3_js_1.PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'), 6, 'RAY', 'RAY'),
    'RAY_USDC-LP': new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, new web3_js_1.PublicKey('FGYXP4vBkMEtKhxrmEBcWN8VNmXX8qNgEJpENKDETZ4Y'), 6, 'RAY-USDC', 'RAY-USDC'),
};

// [SWAP PARAMETERS]

// [scanForBuy.js parameters]
exports.amtBuySol = 0.0003; // amount of SOL to use for buy/sell
exports.targetAccount = "<ADD TARGET ACCOUNT HERE>"
// [scanForBuy.js parameters]

// [SWAP PARAMETERS]

//# sourceMappingURL=config.js.map

//0.5, 550000000