import yargs from 'yargs';
import configCommand from './command/config';
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

export const cmd = (y: yargs.Argv<any>) =>
  y
    .version()
    .usage('Usage: $0 <command>')
    .option('stage', { default: 'default', describe: 'Specify a stage to run this' })
    .demandCommand(1)
    .command(configCommand)
    .command(provisionCommand)
    .command(deployCommand);

export const main = async () => {
  try {
    await cmd(yargs).argv;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
