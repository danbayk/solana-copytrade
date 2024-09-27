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

const copyAccount = new web3.PublicKey(config_1.targetAccount).toBase58();
// const copyAccount = new web3.PublicKey('nPpmNHkQnzGBTxjR64f5MunTGTD8vGLHnfmh4xGDsAU').toBase58();

const connection = new web3.Connection(process.env.RPC_URL_2);

// create a new Client from .env file
// .env must have two variables "ENDPOINT" and "X_TOKEN"
const client = new Client.default(
    process.env.ENDPOINT,
    process.env.X_TOKEN,
    undefined,
);

// subscribe request being send to gRPC, follows SubscribeRequest interface
const req = {
    accounts: {},
    slots: {},
    transactions: {
      raydiumLiquidityPoolV4: {
        vote: false,
        failed: false,
        signature: undefined,
        accountInclude: [copyAccount],
        accountExclude: [],
        accountRequired: [],
      },
    },
    transactionsStatus: {},
    entry: {},
    blocks: {},
    blocksMeta: {},
    accountsDataSlice: [],
    ping: undefined,
    commitment: CommitmentLevel.PROCESSED,
}

const raydiumAmmParser = new RaydiumAmmParser();

const TXN_FORMATTER = new TransactionFormatter();
const IX_PARSER = new SolanaParser([]);
IX_PARSER.addParser(
    RaydiumAmmParser.PROGRAM_ID,
    raydiumAmmParser.parseInstruction.bind(raydiumAmmParser),
);

async function handleStream(client, args){
    const stream = await client.subscribe(); // subscribe for events
    
    // handle errors and stream end events
    const streamClosed = new Promise((resolve, reject) => {
        stream.on("error", (error) => {
            console.log("ERROR", error);
            reject(error);
            stream.end();
        });
        stream.on("end", () => {
            resolve();
        });
        stream.on("close", () => {
            resolve();
        });
    });

    // handle incoming data
    stream.on("data", (data) => {
        if(data?.transaction){
            const txn = TXN_FORMATTER.formTransactionFromJson(
                data.transaction,
                Date.now(),
            );
            parseTxn(txn); // parse incoming data
        }
    });

    // send a subscribe request
    await new Promise((resolve, reject) => {
        stream.write(args, (err) => {
            if(err === null || err == undefined){
                resolve();
            } else{
                reject();
            }
        });
    }).catch((reason) => {
        console.log(reason);
        throw reason;
    });

    await streamClosed; // wait for stream close or error event before closing
}

async function subscribeCommand(client, args){
    while(true){
        try{
            await handleStream(client, args);           
        } catch(error){
            console.log("Stream error, restarting in 1 second...", error);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
}

async function parseTxn(txn){
    let pumpfun = false;
    const parsedIxs = JSON.parse(JSON.stringify(IX_PARSER.parseTransactionWithInnerInstructions(txn), null, 2));
    console.log(new Date());
    // console.log(parsedIxs);
    for(let i = 0; i < parsedIxs.length; i++){
        if(parsedIxs[i]?.name === 'swapBaseIn'){
            const accounts = parsedIxs[i].accounts;
            const marketId = accounts.find(obj => obj.name === 'serumMarket');
            const poolKeys = await derivePoolKeys.derivePoolKeys(marketId.pubkey);

            if(poolKeys.baseMint.toString() === 'So11111111111111111111111111111111111111112') pumpfun = true;

            const poolCoinTokenAccount = accounts.find(obj => obj.name === 'poolCoinTokenAccount');
            const poolPcTokenAccount = accounts.find(obj => obj.name === 'poolPcTokenAccount');
            if(parsedIxs[i + 1].accounts[1].pubkey === poolPcTokenAccount.pubkey && pumpfun === false){
                console.log('buy');
                buyToken(poolKeys);
            }
            else if(parsedIxs[i + 1].accounts[1].pubkey === poolCoinTokenAccount.pubkey && pumpfun === true){
                console.log('buy, pumpfun');
                buyToken(poolKeys);
            }
            if(parsedIxs[i + 1].accounts[1].pubkey === poolCoinTokenAccount.pubkey && pumpfun === false){
                console.log('sell');
                sellToken(poolKeys);
            }
            else if(parsedIxs[i + 1].accounts[1].pubkey === poolPcTokenAccount.pubkey && pumpfun === true){
                console.log('sell, pumpfun');
                sellToken(poolKeys);
            }
        }
    }
}
subscribeCommand(client, req);
console.log('searching...');

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
    const accountInstruction = spl.createAssociatedTokenAccountInstruction(config_1.wallet.publicKey, baseATA, config_1.wallet.publicKey, poolKeys.baseMint, spl.TOKEN_PROGRAM_ID, spl.ASSOCIATED_TOKEN_PROGRAM_ID);
    const swapInstruction = raydium_sdk_1.Liquidity.makeSwapInstruction({
        poolKeys,
        userKeys: {
            tokenAccountIn: quoteATA,
            tokenAccountOut: baseATA,
            owner: config_1.wallet.publicKey
        },
        amountIn: BigInt(config_1.amtBuySol * web3.LAMPORTS_PER_SOL),
        amountOut: new BN(0),
        fixedSide: 'in',
    });
    const tipTransaction = web3.SystemProgram.transfer({
        fromPubkey: new web3.PublicKey(process.env.PUBLIC_KEY),
        toPubkey: new web3.PublicKey(tipAddr),
        lamports: Math.floor(1000000),
    });

    const tx = new web3.Transaction({
        recentBlockhash: (await config_1.connection.getLatestBlockhash()).blockhash,
        feePayer: new web3.PublicKey(process.env.PUBLIC_KEY),
    }).add(setComputeUnits).add(setComputeLimit).add(accountInstruction).add(swapInstruction.innerTransaction.instructions[0]).add(tipTransaction);

    tx.sign(config_1.wallet);
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
            owner: config_1.wallet.publicKey
        },
        amountIn: BigInt(String(tokenAmount)),
        amountOut: new BN(0),
        fixedSide: 'in',
    });
    const tipTransaction = web3.SystemProgram.transfer({
        fromPubkey: new web3.PublicKey(process.env.PUBLIC_KEY),
        toPubkey: new web3.PublicKey(tipAddr),
        lamports: Math.floor(1000000),
    });

    const tx = new web3.Transaction({
        recentBlockhash: (await config_1.connection.getLatestBlockhash()).blockhash,
        feePayer: new web3.PublicKey(process.env.PUBLIC_KEY),
    }).add(setComputeUnits).add(setComputeLimit).add(swapInstruction.innerTransaction.instructions[0]).add(tipTransaction);

    tx.sign(config_1.wallet);
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

async function buyToken(poolKeys){
    if(poolKeys.baseMint.toString() === 'So11111111111111111111111111111111111111112'){
        let temp = poolKeys.baseMint;
        poolKeys.baseMint = poolKeys.quoteMint;
        poolKeys.quoteMint = temp;
    }

    const baseATA = await spl.getAssociatedTokenAddress(poolKeys.baseMint, config_1.wallet.publicKey, false);
    const quoteATA = await spl.getAssociatedTokenAddress(poolKeys.quoteMint, config_1.wallet.publicKey, false);

    console.log(await jitoBuy(poolKeys, baseATA, quoteATA));
}

async function sellToken(poolKeys){
    if(poolKeys.baseMint.toString() === 'So11111111111111111111111111111111111111112'){
        let temp = poolKeys.baseMint;
        poolKeys.baseMint = poolKeys.quoteMint;
        poolKeys.quoteMint = temp;
    }

    const baseATA = await spl.getAssociatedTokenAddress(poolKeys.baseMint, config_1.wallet.publicKey, false);
    const baseATAInfo = await connection.getParsedAccountInfo(baseATA, "processed");
    if(baseATAInfo.value === null){
        console.log("ATA not found");
        return;
    }
    const tokenAmount = baseATAInfo.value.data.parsed.info.tokenAmount.amount;

    const quoteATA = await spl.getAssociatedTokenAddress(poolKeys.quoteMint, config_1.wallet.publicKey, false);
    console.log(await jitoSell(poolKeys, baseATA, quoteATA, tokenAmount));
}