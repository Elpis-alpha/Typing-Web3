"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const close_mint_1 = require("./modules/close-mint");
// run module code
(0, close_mint_1.run)()
    .then(() => {
    console.log(chalk_1.default.green("\n✅ Module completed!"));
})
    .catch((err) => {
    console.error(err);
    console.error(chalk_1.default.red("\n❌ An error occurred"));
})
    .finally(() => {
    console.log(chalk_1.default.gray("\n🚪 Exiting module\n"));
});
