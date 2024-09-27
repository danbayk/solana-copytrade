# Solana Raydium Copy-Trader
## Overview
A program that copies buy and sell transactions from a target account. Buys/sells occurs ~0-2 seconds from target account transaction based on your location in relation to the nearest Jito blockengine.<br>
## !!! BEFORE CONTINUING !!!
This program assumes you have both a Solana gRPC subscription and "fast" RPC connection. I personally use the Shyft gRPC service along with Ligma RPC. Contact me for a version that can be used without paid subscription services.<br>
## How to use:
1. Run ```npm install```
2. Create a ```.env``` file in the root directory with the following variables:
    1. ```PUBLIC_KEY```: Your wallet public key.
    2. ```PRIVATE_KEY```: Your wallet private key.
    3. ```RPC_URL_1```: Primary Solana RPC (your fastest) connection.
    4. ```RPC_URL_2```: Secondary Solana RPC (for low-stakes data requests) connection.
    5. ```WS_URL_SCAN```: Solana websocket connection
    6. ```ENDPOINT```: Your gRPC endpoint.
    7. ```X_TOKEN```: Your gRPC key.
3. Make sure your wallet has both WSOL (for transaction) and SOL (for tx fees).
4. Setup the config.js file with both the amount of WSOL to use per trade and the address of the target account.
5. Run ```node copyTrade/scanForBuy.js``` to start the program.
## !!! DISCLAIMER !!!
Please make sure you read/understand all code if you are putting your public/private keypair into this program.