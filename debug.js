const web3 = require('@solana/web3.js');
const spl = require('@solana/spl-token');
const env = require('dotenv').config();
const BN = require("bn.js");
const derivePoolKeys = require('./copyTrade/derivePoolKeys.js');
const config_1 = require('./utils/config.js');
const raydium_sdk_1 = require('@raydium-io/raydium-sdk');

const connection = new web3.Connection(process.env.RPC_URL_2);

async function getTx(tx){
    return await connection.getParsedTransaction(tx, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed"
    })
}

// connection.getParsedAccountInfo(new web3.PublicKey("6tF6jKeyhA9mNZS13BaNjXLS2CNpxmNzwfmZ6L62SmAJ")).then(out => console.log(out.value.data.parsed));

// buyToken("7zPaHuNWSLZKFGCqvNJNpKbeQjoZSy2CZh32MrNmAWKZ");
// getTx("TpwAGc5WnH4CBcUtXqcjzqFAso86UK6u71yEa6Ywpo3gEH5UsWpfw8TmpA4R4s2JyinB841c9ahFYsbDq8RRTjy").then(out => console.log(out.transaction.message.instructions[3].accounts[8]));

async function buyToken(marketId){
    try{
        const poolKeys = await derivePoolKeys.derivePoolKeys(marketId);
        const baseATA = await spl.getAssociatedTokenAddress(poolKeys.baseMint, config_1.wallet2.publicKey, false);
        const quoteATA = await spl.getAssociatedTokenAddress(poolKeys.quoteMint, config_1.wallet2.publicKey, false);
    
        initiateSwap(poolKeys, baseATA, quoteATA);
    } catch(e){
        buyToken(marketId);
    }
}

async function swap(poolKeys, baseATA, quoteATA){
    // correctly setup baseMint and quoteMint in case they are swapped
    let tokenAddress = poolKeys.baseMint;
    if(poolKeys.baseMint.toString() === "So11111111111111111111111111111111111111112"){
        let temp;
        temp = baseATA;
        baseATA = quoteATA;
        quoteATA = temp;

        tokenAddress = poolKeys.quoteMint;
    }

    // create the swap instruction
    // const setComputeUnits = web3.ComputeBudgetProgram.setComputeUnitPrice({microLamports: 14814814});
    // const setComputeLimit = web3.ComputeBudgetProgram.setComputeUnitLimit({units: 135000});
    const setComputeUnits = web3.ComputeBudgetProgram.setComputeUnitPrice({microLamports: 13345678});
    const setComputeLimit = web3.ComputeBudgetProgram.setComputeUnitLimit({units: 80000});
    // const setComputeUnits = web3.ComputeBudgetProgram.setComputeUnitPrice({microLamports: priorityFees.microLamports});
    // const setComputeLimit = web3.ComputeBudgetProgram.setComputeUnitLimit({units: priorityFees.units});

    const accountInstruction = spl.createAssociatedTokenAccountInstruction(config_1.wallet2.publicKey, baseATA, config_1.wallet2.publicKey, tokenAddress, spl.TOKEN_PROGRAM_ID, spl.ASSOCIATED_TOKEN_PROGRAM_ID);

    const swapInstruction = raydium_sdk_1.Liquidity.makeSwapInstruction({
        poolKeys,
        userKeys: {
            tokenAccountIn: quoteATA,
            tokenAccountOut: baseATA,
            owner: config_1.wallet2.publicKey
        },
        amountIn: BigInt(config_1.amtBuySol * web3.LAMPORTS_PER_SOL),
        amountOut: new BN(0),
        fixedSide: 'in'
    });

    let finalInstructions = [{instructionTypes: [25], instructions: [], signers: []}];
    finalInstructions[0].instructions.push(setComputeUnits);
    finalInstructions[0].instructions.push(setComputeLimit);
    finalInstructions[0].instructions.push(accountInstruction);
    finalInstructions[0].instructions.push(swapInstruction.innerTransaction.instructions[0]);
    
    const tx = await raydium_sdk_1.buildTransaction({
        connection: connection,
        makeTxVersion: config_1.makeTxVersion,
        payer: config_1.wallet2.publicKey,
        innerTransactions: finalInstructions,
    });
    return util.sendTx(connection, config_1.wallet2, tx, {maxRetries: 0, skipPreflight: true, preflightCommitment: "processed"});
}

async function initiateSwap(poolKeys, baseATA, quoteATA){
    // const priorityFees = await getComputeBudgetConfig();
    while(true){
        try{
            await swap(poolKeys, baseATA, quoteATA).then(out => {
                console.log("----- [ATTEMPT SWAP] ----- " + poolKeys.baseMint.toString());
                // console.log(out);
            });
        } catch(e){
            console.log(e);
        }
    }
}

async function tokenTest(marketId){
    const poolKeys = await derivePoolKeys.derivePoolKeys(marketId);
    const baseATA = await spl.getAssociatedTokenAddress(poolKeys.baseMint, config_1.wallet.publicKey, false);
    const baseATAInfo = await connection.getParsedAccountInfo(baseATA);
    console.log(baseATAInfo);
}
tokenTest("BqUpk5VC4Jqdj7rgETLPCmMTbK3jRDrCyzQpHeJpcSZx");