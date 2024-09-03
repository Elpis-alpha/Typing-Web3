import chalk from "chalk";
import { run } from "./modules/close-mint";

// run module code
run()
  .then(() => {
    console.log(chalk.green("\n✅ Module completed!"));
  })
  .catch((err) => {
    console.error(err);
    console.error(chalk.red("\n❌ An error occurred"));
  })
  .finally(() => {
    console.log(chalk.gray("\n🚪 Exiting module\n"));
  });
