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
const helpers_1 = require("@solana-developers/helpers");
const web3_js_1 = require("@solana/web3.js");
const helpers_2 = require("./helpers");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"));
    const keypair = (0, helpers_1.getKeypairFromEnvironment)("SECRET_KEY");
    const keypair2 = (0, helpers_1.getKeypairFromEnvironment)("SECRET_KEY_2");
    const programId = helpers_2.PING_COUNTER_PUBLIC_KEY;
    const programDataId = helpers_2.PING_DATA_PUBLIC_KEY;
    const transaction = new web3_js_1.Transaction().add(new web3_js_1.TransactionInstruction({
        keys: [{ pubkey: programDataId, isSigner: false, isWritable: true }],
        programId,
    }));
    const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [keypair]);
    (0, helpers_2.explorerLinkLog)(signature);
    // console.log(`✅ Transaction completed! Signature is ${signature}`);
});
exports.run = run;
