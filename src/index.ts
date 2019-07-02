import yargs from 'yargs';
import initCommand from './command/init';

/**
 * usage:
 *
 * laita init - configure laita for this project
 * laita provision – sets up the target infrastructure
 * laita deploy – deploys public directory
 */

export const main = async () => {
  try {
    await yargs
      .version()
      .usage('Usage: $0 <command>')
      .option('stage', { default: 'default', describe: 'Specify a stage to run this' })
      .demandCommand(1)
      .command(initCommand).argv;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
