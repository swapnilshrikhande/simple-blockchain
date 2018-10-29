const SHA256 = require("crypto-js/sha256")
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

class Transaction {
    constructor(fromAddress,toAddress,amount){
        this.fromAddress = fromAddress;
        this.toAddress   = toAddress;
        this.amount      = amount;
        this.timestamp   = (new Date()).getTime();
    }

    //this hash would be signed with the our private key
    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp).toString();
    }

    signTransaction(signingKey){
        
        if( signingKey.getPublic("hex") != this.fromAddress ){
            throw new Error("You cannot sign Transaction for other wallets.");
        }
        
        const hashTx = this.calculateHash();
        const sig  = signingKey.sign(hashTx, "base64" );
        this.signature = sig.toDER("hex");
    }

    //check if transaction is correctly signed
    //mining  transactions are not signed
    isValid(){
        if( this.fromAddress == null )
            return true;
        
        if( !this.signature || this.signature.length == 0) {
            throw new Error("Unsigned Transaction : Missing Digital Signature");
        }

        //this will make sure no rogue node can introduce a invalid 
        // block, as he will need the private key to transact.
        const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
        return publicKey.verify(this.calculateHash(), this.signature );
    }
}

class Block {
    constructor(timestamp,transactions,previousHash=''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash(){
        return SHA256(this.previousHash+this.timestamp+JSON.stringify(this.transactions) + this.nonce ).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty+1).join(0) ){
            ++this.nonce;
            this.hash = this.calculateHash();
        }
        console.log( "Block mined :" + this.hash );
    }

    hasValidTransactions(){
        for(const tx of this.transactions){
            if( !tx.isValid())
                return false;
        }
        return true;
    }
}

class BlockChain{

    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 1;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock(){
        return new Block(0,"1/1/2018","Genesis Block","0");
    }

    getLastestBlock(){
        return this.chain[this.chain.length - 1];
    }

    // addBlock(newBlock){
    //     //numerous checks required here
    //     newBlock.previousHash = this.getLastestBlock().hash;
    //     //recalculate as block contents are modified i.e prevHash
    //     // newBlock.hash = newBlock.calculateHash();
    //     newBlock.mineBlock(this.difficulty);
    //     this.chain.push(newBlock);
    // }

    minePendingTransactions(miningRewardAddress){
        //@TODO chunk the pending transactions, miners choose which to include
        const rewardTx = new Transaction(null,miningRewardAddress,this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions,this.getLastestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log("Block successfully mined!");
        this.chain.push(block);
        this.pendingTransactions = [];
    }

    addTransaction(transaction){
        if( !transaction.fromAddress || !transaction.toAddress ){
            throw new Error("Transaction must have to and from address");
        }

        if( !transaction.isValid() ){
            throw new Error("Cannot add invalid transaction to chain");
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;
        for(const block of this.chain){
            for(const trans of block.transactions){
                if( trans.fromAddress === address ){
                    balance -= trans.amount;
                }

                if( trans.toAddress === address ){
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

    isChainValid(){
        for(let i=1; i< this.chain.length; ++i){
            const currentBlock  = this.chain[i];
            const previousBlock = this.chain[i-1];

            //@TODO If blockchain is invalid we should handle it
            if( !currentBlock.hasValidTransactions() ){
                return false;
            }

            if( currentBlock.hash != currentBlock.calculateHash() ){
                return false;
            }

            if( currentBlock.previousHash != previousBlock.hash ){
                return false;
            }
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;