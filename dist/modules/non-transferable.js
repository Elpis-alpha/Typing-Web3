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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintMan = exports.run = void 0;
exports.createNonTransferableMint = createNonTransferableMint;
const helpers_1 = require("@solana-developers/helpers");
const web3_js_1 = require("@solana/web3.js");
const helpers_2 = require("./helpers");
const spl_token_1 = require("@solana/spl-token");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Running non-transferable module");
    const decimals = 9;
    const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"));
    const u2 = (0, helpers_1.getKeypairFromEnvironment)("SECRET_KEY");
    const u3 = (0, helpers_1.getKeypairFromEnvironment)("SECRET_KEY_2");
    const mintKeypair = web3_js_1.Keypair.generate();
    const mint = mintKeypair.publicKey;
    console.log("\nmint public key: " + mintKeypair.publicKey.toBase58() + "\n\n");
    yield createNonTransferableMint(connection, u2, mintKeypair, decimals);
    yield (0, exports.mintMan)(connection, u2, mint, decimals, helpers_2.mainPublicKey);
    const destinationAccount = yield (0, spl_token_1.createAccount)(connection, u2, mintKeypair.publicKey, u3.publicKey, undefined, { commitment: "finalized" }, spl_token_1.TOKEN_2022_PROGRAM_ID);
});
exports.run = run;
function createNonTransferableMint(connection, payer, mintKeypair, decimals) {
    return __awaiter(this, void 0, void 0, function* () {
        const extensions = [spl_token_1.ExtensionType.NonTransferable];
        const mintLength = (0, spl_token_1.getMintLen)(extensions);
        const mintLamports = yield connection.getMinimumBalanceForRentExemption(mintLength);
        console.log("Creating a transaction with non-transferable instruction...");
        const mintTransaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: mintLength,
            lamports: mintLamports,
            programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
        }), (0, spl_token_1.createInitializeNonTransferableMintInstruction)(mintKeypair.publicKey, spl_token_1.TOKEN_2022_PROGRAM_ID), (0, spl_token_1.createInitializeMintInstruction)(mintKeypair.publicKey, decimals, payer.publicKey, null, spl_token_1.TOKEN_2022_PROGRAM_ID));
        const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, mintTransaction, [payer, mintKeypair], { commitment: "finalized" });
        return signature;
    });
}
const mintMan = (connection, payer, mint, decimals, recipient) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Creating an Associated Token Account...");
    const ata = (yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, payer, mint, recipient, undefined, undefined, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID)).address;
    console.log("Minting 1 token...");
    const amount = 1 * 10 ** decimals;
    yield (0, spl_token_1.mintTo)(connection, payer, mint, ata, payer, amount, [payer], { commitment: "finalized" }, spl_token_1.TOKEN_2022_PROGRAM_ID);
    const tokenBalance = yield connection.getTokenAccountBalance(ata, "finalized");
    console.log(`Account ${ata.toBase58()} now has ${tokenBalance.value.uiAmount} token.`);
});
exports.mintMan = mintMan;
