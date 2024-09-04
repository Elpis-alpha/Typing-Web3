"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokenMetaData = exports.sendSol = exports.getBalanceInSOL = exports.initializeModule = exports.createAndAirdropKeypair = exports.shortenAddress = exports.explorerLinkLog = exports.localConnectionURL = exports.PING_DATA_PUBLIC_KEY = exports.PING_COUNTER_PUBLIC_KEY = exports.ELPIS_TEST_MINT_PUBLIC_KEY = exports.mainPublicKey = void 0;
exports.uploadOffChainMetadata = uploadOffChainMetadata;
// @ts-ignore
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const web3_js_1 = require("@solana/web3.js");
const chalk_1 = __importDefault(require("chalk"));
const sdk_1 = __importDefault(require("@irys/sdk"));
const fs_1 = __importDefault(require("fs"));
const helpers_1 = require("@solana-developers/helpers");
exports.mainPublicKey = new web3_js_1.PublicKey("47iCpoU7bscsdHJ26ZHtTFDvRD1JWHZAr7u1n4ALD4Eu");
exports.ELPIS_TEST_MINT_PUBLIC_KEY = new web3_js_1.PublicKey("pqsVvug9nLqPDsA4GLgnfUYuGoLQEfb76s4hAynWBYH");
exports.PING_COUNTER_PUBLIC_KEY = new web3_js_1.PublicKey("ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa");
exports.PING_DATA_PUBLIC_KEY = new web3_js_1.PublicKey("Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod");
const TOKEN_METADATA_PROGRAM_ID = new web3_js_1.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
exports.localConnectionURL = "http://127.0.0.1:8899";
const imageURL = "https://arweave.net/o2HYz76cY8rdGyj-N09ogXioRCe74yMBZZ8nO4fsRzc";
const explorerLinkLog = (signature, type = "tx", network = "devnet") => {
    console.log(chalk_1.default
        .hex("#478be6")
        .underline(`https://explorer.solana.com/${type}/${signature}?cluster=${network}`) + ";");
};
exports.explorerLinkLog = explorerLinkLog;
const shortenAddress = (address, chars = 4) => {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};
exports.shortenAddress = shortenAddress;
const createAndAirdropKeypair = (connection) => __awaiter(void 0, void 0, void 0, function* () {
    const keypair = web3_js_1.Keypair.generate();
    console.log("\nPublic key:", chalk_1.default.yellow(keypair.publicKey.toBase58()));
    console.log("Secret key:", chalk_1.default.yellow(keypair.secretKey.toString()));
    yield connection.requestAirdrop(keypair.publicKey, web3_js_1.LAMPORTS_PER_SOL * 10);
    return keypair;
});
exports.createAndAirdropKeypair = createAndAirdropKeypair;
const initializeModule = (connectionType) => __awaiter(void 0, void 0, void 0, function* () {
    let connectionURL = "";
    switch (connectionType) {
        case "local":
            connectionURL = exports.localConnectionURL;
        case "dev":
            connectionURL = (0, web3_js_1.clusterApiUrl)("devnet");
        case "main":
            connectionURL = (0, web3_js_1.clusterApiUrl)("mainnet-beta");
        case "test":
            connectionURL = (0, web3_js_1.clusterApiUrl)("testnet");
        default:
            connectionURL = exports.localConnectionURL;
    }
    const connection = new web3_js_1.Connection(connectionURL, "confirmed");
    console.log(`\nConnection to ${connectionType}net cluster established`);
    const u2 = (0, helpers_1.getKeypairFromEnvironment)("SECRET_KEY");
    console.log("\nu2:", chalk_1.default.yellow(u2.publicKey.toBase58()));
    const balance = yield (0, exports.getBalanceInSOL)(connection, u2.publicKey, false);
    console.log("bal:", chalk_1.default.yellow(balance));
    const u3 = (0, helpers_1.getKeypairFromEnvironment)("SECRET_KEY_2");
    console.log("\nu3:", chalk_1.default.yellow(u3.publicKey.toBase58()));
    const balance2 = yield (0, exports.getBalanceInSOL)(connection, u3.publicKey, false);
    console.log("bal:", chalk_1.default.yellow(balance2));
    const u4 = (0, helpers_1.getKeypairFromEnvironment)("SECRET_KEY_3");
    console.log("\nu4:", chalk_1.default.yellow(u4.publicKey.toBase58()));
    const balance3 = yield (0, exports.getBalanceInSOL)(connection, u4.publicKey, false);
    console.log("bal:", chalk_1.default.yellow(balance3));
    return { connection, u2, u3, u4 };
});
exports.initializeModule = initializeModule;
const getBalanceInSOL = (connection_1, publicKey_1, ...args_1) => __awaiter(void 0, [connection_1, publicKey_1, ...args_1], void 0, function* (connection, publicKey, log = true) {
    const balance = yield connection.getBalance(publicKey);
    const balanceInSol = balance / web3_js_1.LAMPORTS_PER_SOL;
    if (log)
        console.log(`The balance of the account at ${publicKey.toBase58()} is ${balanceInSol} SOL`);
    return balanceInSol;
});
exports.getBalanceInSOL = getBalanceInSOL;
const sendSol = (connection, from, to, amountInSol) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: web3_js_1.LAMPORTS_PER_SOL * amountInSol,
    }));
    const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [
        from,
    ]);
    return signature;
});
exports.sendSol = sendSol;
const createTokenMetaData = (connection, tokenMintAccount, tokenMetaData, owner) => __awaiter(void 0, void 0, void 0, function* () {
    const metadataData = Object.assign(Object.assign({}, tokenMetaData), { sellerFeeBasisPoints: 0, creators: null, collection: null, uses: null, uri: imageURL });
    const metadataPDAAndBump = web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        tokenMintAccount.toBuffer(),
    ], TOKEN_METADATA_PROGRAM_ID);
    const metadataPDA = metadataPDAAndBump[0];
    const transaction = new web3_js_1.Transaction();
    const createMetadataAccountInstruction = (0, mpl_token_metadata_1.createMetadataAccountV3Instruction)({
        metadata: metadataPDA,
        mint: tokenMintAccount,
        mintAuthority: owner.publicKey,
        payer: owner.publicKey,
        updateAuthority: owner.publicKey,
    }, {
        createMetadataAccountArgsV3: {
            collectionDetails: null,
            data: metadataData,
            isMutable: true,
        },
    });
    transaction.add(createMetadataAccountInstruction);
    const transactionSignature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [owner]);
    return transactionSignature;
});
exports.createTokenMetaData = createTokenMetaData;
function formatIrysUrl(id) {
    return `https://gateway.irys.xyz/${id}`;
}
const getIrysArweave = (secretKey) => __awaiter(void 0, void 0, void 0, function* () {
    const irys = new sdk_1.default({
        network: "devnet",
        token: "solana",
        key: secretKey,
        config: {
            providerUrl: (0, web3_js_1.clusterApiUrl)("devnet"),
        },
    });
    return irys;
});
function uploadOffChainMetadata(inputs, payer) {
    return __awaiter(this, void 0, void 0, function* () {
        const { tokenName, tokenSymbol, tokenDescription, tokenExternalUrl, imagePath, tokenAdditionalMetadata, metadataPath, } = inputs;
        const irys = yield getIrysArweave(payer.secretKey);
        const imageUploadReceipt = yield irys.uploadFile(imagePath);
        const metadata = {
            name: tokenName,
            symbol: tokenSymbol,
            description: tokenDescription,
            external_url: tokenExternalUrl,
            image: formatIrysUrl(imageUploadReceipt.id),
            attributes: Object.entries(tokenAdditionalMetadata || []).map(([trait_type, value]) => ({ trait_type, value })),
        };
        fs_1.default.writeFileSync(metadataPath, JSON.stringify(metadata, null, 4), {
            flag: "w",
        });
        const metadataUploadReceipt = yield irys.uploadFile(metadataPath);
        return formatIrysUrl(metadataUploadReceipt.id);
    });
}
