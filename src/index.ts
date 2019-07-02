import yargs from 'yargs';
import initCommand from './command/init';
import provisionCommand from './command/provision';
import deployCommand from './command/deploy';

/**
 * usage:
 *
 * laita init - configure laita for this project
 * laita provision – sets up the target infrastructure
 * laita deploy – deploys public directory
 */

export interface GlobalOpts {
  stage: string;
}

export const main = async () => {
  try {
    const cmd = yargs
      .version()
      .usage('Usage: $0 <command>')
      .option('stage', { default: 'default', describe: 'Specify a stage to run this' })
      .demandCommand(1)
      .command(initCommand)
      .command(provisionCommand)
      .command(deployCommand);
    await cmd.argv;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
