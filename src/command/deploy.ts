import { CommandModule } from 'yargs';
import { getConfigForStage } from '../util/config';
import { resolveTarget } from '../target';
import { GlobalOpts } from '..';

export interface DeployOpts extends GlobalOpts {}

const handler = async (opts: DeployOpts) => {
  const { stage } = opts;
  const config = getConfigForStage(stage);
  if (!config) {
    console.error(`No configuration found for stage ${stage}. Run "laita config" first`);
    process.exit(1);
  }

  const target = resolveTarget(config.target);
  if (!target) {
    console.error('Invalid target');
    return process.exit(1);
  }

  await target.deploy(opts);
};

const command: CommandModule<{}, DeployOpts> = {
  command: 'deploy',
  describe: 'deploys public directory',
  handler,
};

export default command;
