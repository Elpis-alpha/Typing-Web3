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
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"));
    const keypair = (0, helpers_2.getKeypairFromEnvironment)("SECRET_KEY");
    const keypair2 = (0, helpers_2.getKeypairFromEnvironment)("SECRET_KEY_2");
    const address = new web3_js_1.PublicKey(helpers_1.mainPublicKey);
    const address1 = keypair.publicKey;
    const address2 = keypair2.publicKey;
    console.table([
        {
            address: address.toBase58().slice(0, 3),
            balance: yield (0, helpers_1.getBalanceInSOL)(connection, address, false),
        },
        {
            address: address1.toBase58().slice(0, 3),
            balance: yield (0, helpers_1.getBalanceInSOL)(connection, address1, false),
        },
        {
            address: address2.toBase58().slice(0, 3),
            balance: yield (0, helpers_1.getBalanceInSOL)(connection, address2, false),
        },
    ]);
    const signature = yield (0, helpers_1.sendSol)(connection, keypair2, address1, 0.5);
    console.table([
        {
            address: address.toBase58().slice(0, 3),
            balance: yield (0, helpers_1.getBalanceInSOL)(connection, address, false),
        },
        {
            address: address1.toBase58().slice(0, 3),
            balance: yield (0, helpers_1.getBalanceInSOL)(connection, address1, false),
        },
        {
            address: address2.toBase58().slice(0, 3),
            balance: yield (0, helpers_1.getBalanceInSOL)(connection, address2, false),
        },
    ]);
    console.log(`Transaction signature is ${signature}!`);
});
exports.run = run;
