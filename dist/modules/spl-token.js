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
    // const connection = new Connection(clusterApiUrl("devnet"));
    const connection = new web3_js_1.Connection(helpers_1.localConnectionURL);
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
    console.log("\n");
    const sss = yield connection.getTokenAccountsByOwner(u1Address, {
        programId: spl_token_1.TOKEN_PROGRAM_ID,
    });
    const jjj = yield connection.getTokenAccountsByOwner(u1Address, {
        programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
    });
    console.log({ sss, jjj });
});
exports.run = run;
