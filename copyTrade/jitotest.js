const dotenv = require('dotenv/config');
const Client = require("@triton-one/yellowstone-grpc");
const { CommitmentLevel } = require("@triton-one/yellowstone-grpc");
const web3 = require("@solana/web3.js");
const { SolanaParser } = require("@shyft-to/solana-transaction-parser");
const TransactionFormatter = require("../utils/transaction-formatter.js");
const RaydiumAmmParser = require('../parsers/raydium-amm-parser.js');
const raydium_sdk_1 = require('@raydium-io/raydium-sdk');
const spl = require('@solana/spl-token');
const BN = require("bn.js");
const bs58 = require('bs58');
const derivePoolKeys = require('./derivePoolKeys.js');
const config_1 = require('../utils/config.js');

const connection = new web3.Connection(process.env.RPC_URL_2);

async function jitoBuy(poolKeys, baseATA, quoteATA){
    const tipAddrs = [
        "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5", 
        "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
        "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
        "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
        "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
        "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
        "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
        "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT"
    ];
    const tipAddr = tipAddrs[Math.floor(Math.random() * tipAddrs.length)];

    const setComputeUnits = web3.ComputeBudgetProgram.setComputeUnitPrice({microLamports: 1400031});
    const setComputeLimit = web3.ComputeBudgetProgram.setComputeUnitLimit({units: 80000});
    const accountInstruction = spl.createAssociatedTokenAccountInstruction(config_1.wallet2.publicKey, baseATA, config_1.wallet2.publicKey, poolKeys.baseMint, spl.TOKEN_PROGRAM_ID, spl.ASSOCIATED_TOKEN_PROGRAM_ID);
    const swapInstruction = raydium_sdk_1.Liquidity.makeSwapInstruction({
        poolKeys,
        userKeys: {
            tokenAccountIn: quoteATA,
            tokenAccountOut: baseATA,
            owner: config_1.wallet2.publicKey
        },
        amountIn: BigInt(config_1.amtBuySol * web3.LAMPORTS_PER_SOL),
        amountOut: new BN(0),
        fixedSide: 'in',
    });
    const tipTransaction = web3.SystemProgram.transfer({
        fromPubkey: new web3.PublicKey(process.env.PUBLIC_KEY_2),
        toPubkey: new web3.PublicKey(tipAddr),
        lamports: Math.floor(100000),
    });

    const tx = new web3.Transaction({
        recentBlockhash: (await config_1.connection.getLatestBlockhash()).blockhash,
        feePayer: new web3.PublicKey(process.env.PUBLIC_KEY_2),
    }).add(accountInstruction).add(swapInstruction.innerTransaction.instructions[0]).add(tipTransaction);

    tx.sign(config_1.wallet2);
    const serializedTx = tx.serialize();
    const b58encodedTransaction = bs58.default.encode(serializedTx);

    const resp = await fetch("https://ny.mainnet.block-engine.jito.wtf/api/v1/transactions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "sendTransaction",
            "params": [b58encodedTransaction]
        })
    })
    return resp;
}

async function jitoSell(poolKeys, baseATA, quoteATA, tokenAmount){
    const tipAddrs = [
        "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5", 
        "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
        "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
        "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
        "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
        "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
        "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
        "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT"
    ];
    const tipAddr = tipAddrs[Math.floor(Math.random() * tipAddrs.length)];

    const setComputeUnits = web3.ComputeBudgetProgram.setComputeUnitPrice({microLamports: 1400031});
    const setComputeLimit = web3.ComputeBudgetProgram.setComputeUnitLimit({units: 80000});
    const swapInstruction = raydium_sdk_1.Liquidity.makeSwapInstruction({
        poolKeys,
        userKeys: {
            tokenAccountIn: baseATA,
            tokenAccountOut: quoteATA,
            owner: config_1.wallet2.publicKey
        },
        amountIn: BigInt(String(tokenAmount)),
        amountOut: new BN(0),
        fixedSide: 'in',
    });
    const tipTransaction = web3.SystemProgram.transfer({
        fromPubkey: new web3.PublicKey(process.env.PUBLIC_KEY_2),
        toPubkey: new web3.PublicKey(tipAddr),
        lamports: Math.floor(100000),
    });

    const tx = new web3.Transaction({
        recentBlockhash: (await config_1.connection.getLatestBlockhash()).blockhash,
        feePayer: new web3.PublicKey(process.env.PUBLIC_KEY_2),
    }).add(swapInstruction.innerTransaction.instructions[0]).add(tipTransaction);

    tx.sign(config_1.wallet2);
    const serializedTx = tx.serialize();
    const b58encodedTransaction = bs58.default.encode(serializedTx);

    const resp = await fetch("https://ny.mainnet.block-engine.jito.wtf/api/v1/transactions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "sendTransaction",
            "params": [b58encodedTransaction]
        })
    })
    return resp;
}

async function buyToken(marketId){
    const poolKeys = await derivePoolKeys.derivePoolKeys(marketId);

    if(poolKeys.baseMint.toString() === 'So11111111111111111111111111111111111111112'){
        let temp = poolKeys.baseMint;
        poolKeys.baseMint = poolKeys.quoteMint;
        poolKeys.quoteMint = temp;
    }

    const baseATA = await spl.getAssociatedTokenAddress(poolKeys.baseMint, config_1.wallet2.publicKey, false);
    const quoteATA = await spl.getAssociatedTokenAddress(poolKeys.quoteMint, config_1.wallet2.publicKey, false);

    console.log(await jitoBuy(poolKeys, baseATA, quoteATA));
}

async function sellToken(marketId){
    const poolKeys = await derivePoolKeys.derivePoolKeys(marketId);

    if(poolKeys.baseMint.toString() === 'So11111111111111111111111111111111111111112'){
        let temp = poolKeys.baseMint;
        poolKeys.baseMint = poolKeys.quoteMint;
        poolKeys.quoteMint = temp;
    }

    const baseATA = await spl.getAssociatedTokenAddress(poolKeys.baseMint, config_1.wallet2.publicKey, false);
    const baseATAInfo = await connection.getParsedAccountInfo(baseATA, "processed");
    if(baseATAInfo.value === null){
        console.log("ATA not found");
        return;
    }
    const tokenAmount = baseATAInfo.value.data.parsed.info.tokenAmount.amount;

    const quoteATA = await spl.getAssociatedTokenAddress(poolKeys.quoteMint, config_1.wallet2.publicKey, false);
    console.log(await jitoSell(poolKeys, baseATA, quoteATA, tokenAmount));
}

buyToken("heidsEqbeQrjwgSLUYKuwpzKdcH4AJrrK3tVd4RQ9Rc");
// sellToken("Hhq5FCpLYdQixc3Agph3sCgooW9pXMDzoh2BPWFmmHiN");