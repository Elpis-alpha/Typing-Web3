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
exports.run = void 0;
const web3_js_1 = require("@solana/web3.js");
const helpers_1 = require("./helpers");
const helpers_2 = require("@solana-developers/helpers");
const spl_token_1 = require("@solana/spl-token");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"));
    const u2 = (0, helpers_2.getKeypairFromEnvironment)("SECRET_KEY");
    const u3 = (0, helpers_2.getKeypairFromEnvironment)("SECRET_KEY_2");
    const u1Address = helpers_1.mainPublicKey;
    const { publicKey: u2Address } = u2;
    const { publicKey: u3Address } = u3;
    console.table([
        { name: "user-1", address: u1Address.toBase58().slice(0, 4) },
        { name: "user-2", address: u2Address.toBase58().slice(0, 4) },
        { name: "user-3", address: u3Address.toBase58().slice(0, 4) },
    ]);
    console.log("\nCreating mint...");
    // const mint = await createMint(connection, u2, u2Address, u2Address, 5);
    const mint = new web3_js_1.PublicKey("GydgWTemzimjQgKpiBzn9ATEuXxQNMJnzzyp9fe316hj");
    console.log("Mint created!", mint.toBase58());
    (0, helpers_1.explorerLinkLog)(mint.toBase58(), "address");
    // console.log("\nStoring token metadata...");
    // const metaDataTransactionSignature = await createTokenMetaData(
    //   connection,
    //   mint,
    //   { name: "Elpis Moon", symbol: "E_MOON" },
    //   u2
    // );
    // console.log("Token metadata stored!");
    // explorerLinkLog(metaDataTransactionSignature);
    console.log("\nGetting or creating associated token account for u1...");
    const u1AssociatedTokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, u2, mint, u1Address);
    console.log("Associated token account created!", u1AssociatedTokenAccount.address.toBase58());
    (0, helpers_1.explorerLinkLog)(u1AssociatedTokenAccount.address.toBase58(), "address");
    console.log("\nGetting or creating associated token account for u2...");
    const u2AssociatedTokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, u2, mint, u2Address);
    console.log("Associated token account created!", u2AssociatedTokenAccount.address.toBase58());
    (0, helpers_1.explorerLinkLog)(u2AssociatedTokenAccount.address.toBase58(), "address");
    console.log("\nGetting or creating associated token account for u3...");
    const u3AssociatedTokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, u3, mint, u3Address);
    console.log("Associated token account created!", u3AssociatedTokenAccount.address.toBase58());
    (0, helpers_1.explorerLinkLog)(u3AssociatedTokenAccount.address.toBase58(), "address");
    console.log("\n");
    console.table([
        {
            name: "user-1",
            address: u1Address.toBase58().slice(0, 4),
            associated: u1AssociatedTokenAccount.address.toBase58().slice(0, 4),
            amount: u1AssociatedTokenAccount.amount / BigInt(100000),
        },
        {
            name: "user-2",
            address: u2Address.toBase58().slice(0, 4),
            associated: u2AssociatedTokenAccount.address.toBase58().slice(0, 4),
            amount: u2AssociatedTokenAccount.amount / BigInt(100000),
        },
        {
            name: "user-3",
            address: u3Address.toBase58().slice(0, 4),
            associated: u3AssociatedTokenAccount.address.toBase58().slice(0, 4),
            amount: u3AssociatedTokenAccount.amount / BigInt(100000),
        },
    ]);
    console.log("\nMinting tokens to u2...");
    const mintTransactionSignature = yield (0, spl_token_1.mintTo)(connection, u2, mint, u2AssociatedTokenAccount.address, u2Address, 620 * 100000);
    console.log("Tokens minted!");
    (0, helpers_1.explorerLinkLog)(mintTransactionSignature);
    console.log("\nMinting tokens to u1...");
    const mintTransactionSignature3 = yield (0, spl_token_1.mintTo)(connection, u2, mint, u1AssociatedTokenAccount.address, u2Address, 500 * 100000);
    console.log("Tokens minted!");
    (0, helpers_1.explorerLinkLog)(mintTransactionSignature3);
    console.log("\nTransferring tokens from u2 to u3...");
    const transferTransactionSignature = yield (0, spl_token_1.transfer)(connection, u2, u2AssociatedTokenAccount.address, u3AssociatedTokenAccount.address, u2Address, 20 * 100000);
    console.log("Tokens transferred!");
    (0, helpers_1.explorerLinkLog)(transferTransactionSignature);
    let u1TokenBalance = yield connection.getTokenAccountBalance(u1AssociatedTokenAccount.address);
    let u2TokenBalance = yield connection.getTokenAccountBalance(u2AssociatedTokenAccount.address);
    let u3TokenBalance = yield connection.getTokenAccountBalance(u3AssociatedTokenAccount.address);
    console.log("\n");
    console.table([
        {
            name: "user-1",
            address: u1Address.toBase58().slice(0, 4),
            associated: u1AssociatedTokenAccount.address.toBase58().slice(0, 4),
            amount: u1TokenBalance.value.uiAmount,
        },
        {
            name: "user-2",
            address: u2Address.toBase58().slice(0, 4),
            associated: u2AssociatedTokenAccount.address.toBase58().slice(0, 4),
            amount: u2TokenBalance.value.uiAmount,
        },
        {
            name: "user-3",
            address: u3Address.toBase58().slice(0, 4),
            associated: u3AssociatedTokenAccount.address.toBase58().slice(0, 4),
            amount: u3TokenBalance.value.uiAmount,
        },
    ]);
});
exports.run = run;
