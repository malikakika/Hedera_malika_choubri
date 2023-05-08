console.clear();
require("dotenv").config();
const {
    AccountId,
    PrivateKey,
    Client,
    TopicCreateTransaction,
    TopicMessageQuery,
    TopicMessageSubmitTransaction,
    TopicDeleteTransaction,
} = require("@hashgraph/sdk");


const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);


const client = Client.forTestnet();


client.setOperator(operatorId, operatorKey);

async function main() {
    //créer un topic 
    let txResponse = await new TopicCreateTransaction()
        .setAdminKey(operatorKey)
        .setSubmitKey(operatorKey)
        .execute(client);


    let receipt = await txResponse.getReceipt(client);
    let topicId = receipt.topicId;
    console.log(`Your topic ID is: ${topicId}`);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    // retourner les info du topic 

    new TopicMessageQuery()
        .setTopicId(topicId)
        .subscribe(client, null, (memo) => {
            let messageAsString = Buffer.from(memo.contents, "utf8").toString();
            console.log(
                `${memo.consensusTimestamp.toDate()} Received: ${memoAsString}`
            );
        });






    //soumettre 

    while (true) {

        let sendResponse = await new TopicMessageSubmitTransaction({
            topicId: topicId,
            message: "Hello, World!, " + new Date(),
        }).execute(client);
        const getReceipt = await sendResponse.getReceipt(client);

        console.log(
            "The message transaction status: " + getReceipt.status.toString()
        );


        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
}
main();
