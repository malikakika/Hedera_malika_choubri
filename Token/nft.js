require("dotenv").config();
const {
    Client,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenUpdateTransaction,
    TokenInfoQuery,
    TokenAssociateTransaction,
    AccountBalanceQuery,
    PrivateKey,
    TokenMintTransaction,
    TokenBurnTransaction,
} = require("@hashgraph/sdk");

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
const mysecondPrivateKey = PrivateKey.fromString(process.env.SECOND_ACCOUNT_ID);
const mythirdPrivateKey = PrivateKey.fromString(process.env.THIRD_ACCOUNT_ID);

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);



async function main() {


    //Create NFT 
    let tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName("MyCHNFT")
        .setTokenSymbol("MCNFT")
        .setTokenType(TokenType.NonFungibleUnique)
        .setInitialSupply(5000)
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(myPrivateKey)
        .setAdminKey(mysecondPrivateKey)
        .setScheduleKey(mythirdPrivateKey)
        .freezeWith(client);

    let tokenCreateSign = await tokenCreateTx.sign(myPrivateKey);
    let tokenCreateSubmit = await tokenCreateSign.execute(client);
    let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
    let tokenId = tokenCreateRx.tokenId;
    console.log(`- Created token with ID: ${tokenId}`);
    console.log("-----------------------------------");
    //Create a custom token fixed fee
    new CustomFixedFee()
        .setAmount(0.05)
        .setDenominatingTokenId(tokenId) // The token to charge the fee in
        .setFeeCollectorAccountId(feeCollectorAccountId);
    //Create the transaction and freeze for manual signing
    const transaction = await new TokenUpdateTransaction()
        .setTokenId(tokenId)
        .setTokenName("NouveauToken ")
        .freezeWith(client);

    //Sign the transaction with the admin key
    const signTx = await transaction.sign(adminKey);

    //Submit the signed transaction to a Hedera network
    const txResponse = await signTx.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction consensus status
    const transactionStatus = receipt.status.toString();

    console.log("The transaction consensus status is " + transactionStatus);





    // Mint  NFT
    let mintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([
            Buffer.from("ipfs://QmTzWcVfk88JRqjTpVwHzBeULRTNzHY7mnBSG42CpwHmPa"),
            Buffer.from("secondToken"),
        ])
        .execute(client);
    let mintRx = await mintTx.getReceipt(client);
    //Log the serial number
    console.log(`- Created NFT ${tokenId} with serial: ${mintRx.serials} \n`);

    console.log("-----------------------------------");



    //Create the associate transaction and sign with Alice's key 
    const associateAliceTx = await new TokenAssociateTransaction()
        .setAccountId(aliceId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(mysecondPrivateKey);

    //Submit the transaction to a Hedera network
    const associateAliceTxSubmit = await associateAliceTx.execute(client);

    //Get the transaction receipt
    const associateAliceRx = await associateAliceTxSubmit.getReceipt(client);

    //Confirm the transaction was successful
    console.log(`- NFT association with Alice's account: ${associateAliceRx.status}\n`);


    //Create the associate transaction and sign with Alice's key 
    const associateMalikaTx = await new TokenAssociateTransaction()
        .setAccountId(malikaId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(mythirdPrivateKey);

    //Submit the transaction to a Hedera network
    const associateMalikaTxSubmit = await associateMalikaTx.execute(client);

    //Get the transaction receipt
    const associateMalikaRx = await associateMalikaTxSubmit.getReceipt(client);

    //Confirm the transaction was successful
    console.log(`- NFT association with Malika's account: ${associateMalikaRx.status}\n`);



    // Check the balance before the transfer for the treasury account
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(treasuryId).execute(client);
    console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);

    // Check the balance before the transfer for Alice's account
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(aliceId).execute(client);
    console.log(`- Alice's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);

    // Transfer the NFT from treasury to Alice
    // Sign with the treasury key to authorize the transfer
    const tokenTransferTx = await new TransferTransaction()
        .addNftTransfer(tokenId, 1, treasuryId, aliceId)
        .freezeWith(client)
        .sign(treasuryKey);

    const tokenTransferSubmit = await tokenTransferTx.execute(client);
    const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

    console.log(`\n- NFT transfer from Treasury to Alice: ${tokenTransferRx.status} \n`);

    // Check the balance of the treasury account after the transfer
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(treasuryId).execute(client);
    console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);

    // Check the balance of Alice's account after the transfer
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(aliceId).execute(client);
    console.log(`- Alice's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);

    // Check the balance of Malika's account after the transfer
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(malikaId).execute(client);
    console.log(`- Malika's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);
    //Update a custom fee
    new CustomRoyaltyFee(0.1)

}

main();
