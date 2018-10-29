
 /**
 * TODO
 * handle incorrect blockchain
 * support peer to peer synching
 * support balance check before a transaction is allowed.
*/


const {BlockChain,Transaction} = require("./blockchain");

const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const myKey = ec.keyFromPrivate("ab2053a6000c860bca4fb00fc7b2809332fdabe27025d855da37b7d44ee9fded");
const myWalletAddress = myKey.getPublic("hex");

let mycoin = new BlockChain();
const tx1  =  new Transaction(myWalletAddress,"publicKey",10);
tx1.signTransaction(myKey);
mycoin.addTransaction(tx1);

// mycoin.createTransaction(new Transaction('address1','address2',100));
// mycoin.createTransaction(new Transaction('address2','address1',50));

console.log("Starting the miner...");
mycoin.minePendingTransactions(myWalletAddress);

console.log("My balance is",mycoin.getBalanceOfAddress(myWalletAddress) );

console.log("Is chain valid ? "+mycoin.isChainValid());

mycoin.chain[1].transactions[0].amount = 1;

console.log("Is chain valid ? "+mycoin.isChainValid());


// console.log("Starting the miner...");
// mycoin.minePendingTransactions(myWalletAddress);
// console.log("My balance is",mycoin.getBalanceOfAddress(myWalletAddress) );


// console.log("Mining block 1...");
// mycoin.addBlock( new Block(1,"10/7/2017",{amount :4}) );
// console.log("Mining block 2...");
// mycoin.addBlock( new Block(1,"12/7/2017",{amount :10}) );

// console.log( ' is valid ? ' + mycoin.isChainValid());
// mycoin.chain[1].data = { amount : 411};
// mycoin.chain[1].hash = mycoin.chain[1].calculateHash();
// console.log( ' is valid ? ' + mycoin.isChainValid());

//console.log( JSON.stringify(mycoin,null,4) );
