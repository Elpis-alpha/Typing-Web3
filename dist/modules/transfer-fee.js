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
exports.createMintWithTransferFee = createMintWithTransferFee;
const helpers_1 = require("@solana-developers/helpers");
const web3_js_1 = require("@solana/web3.js");
const chalk_1 = __importDefault(require("chalk"));
const helpers_2 = require("./helpers");
const spl_token_1 = require("@solana/spl-token");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("\nRunning transfer-fee module");
    const connection = new web3_js_1.Connection(helpers_2.localConnectionURL, "confirmed");
    console.log("\nConnection to localnet cluster established");
    const u2 = (0, helpers_1.getKeypairFromEnvironment)("SECRET_KEY");
    console.log("\nu2:", chalk_1.default.yellow(u2.publicKey.toBase58()));
    const balance = yield (0, helpers_2.getBalanceInSOL)(connection, u2.publicKey, false);
    console.log("bal:", chalk_1.default.yellow(balance));
    const u3 = (0, helpers_1.getKeypairFromEnvironment)("SECRET_KEY_2");
    console.log("\nu3:", chalk_1.default.yellow(u3.publicKey.toBase58()));
    const balance2 = yield (0, helpers_2.getBalanceInSOL)(connection, u3.publicKey, false);
    console.log("bal:", chalk_1.default.yellow(balance2));
    const u4 = (0, helpers_1.getKeypairFromEnvironment)("SECRET_KEY_3");
    console.log("\nu4:", chalk_1.default.yellow(u4.publicKey.toBase58()));
    const balance3 = yield (0, helpers_2.getBalanceInSOL)(connection, u4.publicKey, false);
    console.log("bal:", chalk_1.default.yellow(balance3));
    const mintKeyPair = web3_js_1.Keypair.generate();
    const { publicKey: mint } = mintKeyPair;
    console.log("\nMint:", chalk_1.default.yellow(mint.toBase58()));
    // CREATE MINT WITH TRANSFER FEE
    const decimals = 9;
    const feeBasisPoints = 1000;
    const maxFee = BigInt(5000);
    yield createMintWithTransferFee(connection, u2, mintKeyPair, decimals, feeBasisPoints, maxFee);
    // CREATE FEE VAULT ACCOUNT
    console.log("\nCreating a fee vault account...");
    const feeVaultAccount = yield (0, spl_token_1.createAssociatedTokenAccount)(connection, u2, mintKeyPair.publicKey, u2.publicKey, { commitment: "finalized" }, spl_token_1.TOKEN_2022_PROGRAM_ID);
    const initialBalance = (yield connection.getTokenAccountBalance(feeVaultAccount, "finalized")).value.amount;
    console.log("Current fee vault balance: ", chalk_1.default.yellow(initialBalance));
    // CREATE A SOURCE AND DESTINATION ACCOUNT AND MINT TOKEN
    console.log("\nCreating source account...");
    const sourceAccount = yield (0, spl_token_1.createAccount)(connection, u3, mint, u3.publicKey, undefined, { commitment: "finalized" }, spl_token_1.TOKEN_2022_PROGRAM_ID);
    console.log("Creating destination account...");
    const destinationAccount = yield (0, spl_token_1.createAccount)(connection, u4, mint, u4.publicKey, undefined, { commitment: "finalized" }, spl_token_1.TOKEN_2022_PROGRAM_ID);
    console.log("Minting 10 tokens to source...");
    const amountToMint = 10 * 10 ** decimals;
    yield (0, spl_token_1.mintTo)(connection, u3, mint, sourceAccount, u2, amountToMint, [u2], { commitment: "finalized" }, spl_token_1.TOKEN_2022_PROGRAM_ID);
    console.log(chalk_1.default.green("Minted 10 tokens to source"));
    // TRANSFER TOKENS
    console.log("\nTransferring with fee transaction...");
    const transferAmount = BigInt(1 * 10 ** decimals);
    const mintAccount = yield (0, spl_token_1.getMint)(connection, mint, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
    const transferFeeAmount = (0, spl_token_1.getTransferFeeConfig)(mintAccount);
    const fee = (0, spl_token_1.calculateFee)(transferFeeAmount === null || transferFeeAmount === void 0 ? void 0 : transferFeeAmount.newerTransferFee, transferAmount);
    const transferSignature = yield (0, spl_token_1.transferCheckedWithFee)(connection, u2, sourceAccount, mint, destinationAccount, u3.publicKey, transferAmount, decimals, fee, [u3], { commitment: "finalized" }, spl_token_1.TOKEN_2022_PROGRAM_ID);
    const sourceAccountAfterTransfer = yield (0, spl_token_1.getAccount)(connection, sourceAccount, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
    const destinationAccountAfterTransfer = yield (0, spl_token_1.getAccount)(connection, destinationAccount, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
    const withheldAmountAfterTransfer = (0, spl_token_1.getTransferFeeAmount)(destinationAccountAfterTransfer);
    console.log(`Source Token Balance:`, chalk_1.default.yellow(sourceAccountAfterTransfer.amount));
    console.log(`Destination Token Balance:`, chalk_1.default.yellow(destinationAccountAfterTransfer.amount));
    console.log(`Withheld Transfer Fees:`, chalk_1.default.yellow(withheldAmountAfterTransfer === null || withheldAmountAfterTransfer === void 0 ? void 0 : withheldAmountAfterTransfer.withheldAmount));
    // // FETCH ACCOUNTS WITH WITHHELD TOKENS
    // // WITHDRAW WITHHELD TOKENS
    // // VERIFY UPDATED FEE VAULT BALANCE
    // // HARVEST WITHHELD TOKENS TO MINT
    // // WITHDRAW HARVESTED TOKENS
    // // VERIFY UPDATED FEE VAULT BALANCE
});
exports.run = run;
function createMintWithTransferFee(connection, payer, mintKeypair, decimals, feeBasisPoints, maxFee) {
    return __awaiter(this, void 0, void 0, function* () {
        const extensions = [spl_token_1.ExtensionType.TransferFeeConfig];
        const mintLength = (0, spl_token_1.getMintLen)(extensions);
        const mintLamports = yield connection.getMinimumBalanceForRentExemption(mintLength);
        console.log("\nCreating a transaction with transfer fee instruction...");
        const mintTransaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: mintLength,
            lamports: mintLamports,
            programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
        }), (0, spl_token_1.createInitializeTransferFeeConfigInstruction)(mintKeypair.publicKey, payer.publicKey, payer.publicKey, feeBasisPoints, maxFee, spl_token_1.TOKEN_2022_PROGRAM_ID), (0, spl_token_1.createInitializeMintInstruction)(mintKeypair.publicKey, decimals, payer.publicKey, null, spl_token_1.TOKEN_2022_PROGRAM_ID));
        console.log("Sending transaction...");
        const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, mintTransaction, [payer, mintKeypair], { commitment: "finalized" });
        console.log(chalk_1.default.green("Transaction confirmed"));
        return signature;
    });
}
