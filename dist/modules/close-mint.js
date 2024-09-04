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
exports.run = void 0;
exports.createClosableMint = createClosableMint;
const web3_js_1 = require("@solana/web3.js");
const helpers_1 = require("./helpers");
const spl_token_1 = require("@solana/spl-token");
const chalk_1 = __importDefault(require("chalk"));
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("\nRunning close-mint module");
    const { connection, u2, u3 } = yield (0, helpers_1.initializeModule)("local");
    const mintKeyPair = web3_js_1.Keypair.generate();
    const { publicKey: mint } = mintKeyPair;
    console.log("\nMint:", chalk_1.default.yellow(mint.toBase58()));
    const decimals = 5;
    yield createClosableMint(connection, u2, mintKeyPair, decimals);
    console.log("\nCreating sourceAccount...");
    const sourceAccount = yield (0, spl_token_1.createAccount)(connection, u3, mint, u3.publicKey, undefined, { commitment: "finalized" }, spl_token_1.TOKEN_2022_PROGRAM_ID);
    console.log("Minting 1 token to sourceAccount...");
    const amount = 1 * web3_js_1.LAMPORTS_PER_SOL;
    yield (0, spl_token_1.mintTo)(connection, u2, mint, sourceAccount, u2, amount, [u2], { commitment: "finalized" }, spl_token_1.TOKEN_2022_PROGRAM_ID);
    console.log(chalk_1.default.green("Minted 1 token to sourceAccount"));
    const mintInfo = yield (0, spl_token_1.getMint)(connection, mintKeyPair.publicKey, "finalized", spl_token_1.TOKEN_2022_PROGRAM_ID);
    console.log("\nInitial supply: ", mintInfo.supply);
    try {
        yield (0, spl_token_1.closeAccount)(connection, u2, mintKeyPair.publicKey, u2.publicKey, u2, [], { commitment: "finalized" }, spl_token_1.TOKEN_2022_PROGRAM_ID);
        console.log(chalk_1.default.green("\nClose account successful"));
    }
    catch (e) {
        console.log("\nClose account fails here because the supply is not zero. Check the program logs:", e.logs);
        console.log(chalk_1.default.red("\nClose account failed"));
    }
    const sourceAccountInfo = yield (0, spl_token_1.getAccount)(connection, sourceAccount, "finalized", spl_token_1.TOKEN_2022_PROGRAM_ID);
    console.log("\nBurning the supply...");
    const burnSignature = yield (0, spl_token_1.burn)(connection, u3, sourceAccount, mintKeyPair.publicKey, u3, sourceAccountInfo.amount, [], { commitment: "finalized" }, spl_token_1.TOKEN_2022_PROGRAM_ID);
    console.log(chalk_1.default.green("Burn successful"));
    const mintInfo1 = yield (0, spl_token_1.getMint)(connection, mintKeyPair.publicKey, "finalized", spl_token_1.TOKEN_2022_PROGRAM_ID);
    console.log("\nAfter burn supply: ", mintInfo1.supply);
    const accountInfoBeforeClose = yield connection.getAccountInfo(mintKeyPair.publicKey, "finalized");
    console.log("\nAccount closed? ", accountInfoBeforeClose === null);
    console.log("\nClosing account after burning the supply...");
    const closeSignature = yield (0, spl_token_1.closeAccount)(connection, u2, mintKeyPair.publicKey, u2.publicKey, u2, [], { commitment: "finalized" }, spl_token_1.TOKEN_2022_PROGRAM_ID);
    console.log(chalk_1.default.green("Close account successful"));
    const accountInfoAfterClose = yield connection.getAccountInfo(mintKeyPair.publicKey, "finalized");
    console.log("\nAccount closed? ", accountInfoAfterClose === null);
});
exports.run = run;
function createClosableMint(connection, payer, mintKeypair, decimals) {
    return __awaiter(this, void 0, void 0, function* () {
        const extensions = [spl_token_1.ExtensionType.MintCloseAuthority];
        const mintLength = (0, spl_token_1.getMintLen)(extensions);
        const mintLamports = yield connection.getMinimumBalanceForRentExemption(mintLength);
        console.log("\nCreating a transaction with close mint instruction...");
        const mintTransaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: mintLength,
            lamports: mintLamports,
            programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
        }), (0, spl_token_1.createInitializeMintCloseAuthorityInstruction)(mintKeypair.publicKey, payer.publicKey, spl_token_1.TOKEN_2022_PROGRAM_ID), (0, spl_token_1.createInitializeMintInstruction)(mintKeypair.publicKey, decimals, payer.publicKey, null, spl_token_1.TOKEN_2022_PROGRAM_ID));
        console.log("Sending transaction...");
        const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, mintTransaction, [payer, mintKeypair], { commitment: "finalized" });
        console.log(chalk_1.default.green("Transaction confirmed"));
        return signature;
    });
}
