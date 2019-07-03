import path from 'path';
import fs from 'fs-extra';
import { CommandModule } from 'yargs';
import ejs from 'ejs';
import { getConfigForStage, terraformDir, configDir as getConfigDir, getFullConfig } from '../util/config';
import { resolveTarget } from '../target';
import { GlobalOpts } from '..';

export interface ProvisionOpts extends GlobalOpts {
  apply: boolean;
}

const handler = async (opts: ProvisionOpts) => {
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

  // make sure config dir exists
  const configDir = getConfigDir();
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }

  const fullConfig = getFullConfig();
  if (fullConfig.terraformBackend) {
    // write terraform template
    const configDir = getConfigDir();
    const output: string = await ejs.renderFile(terraformDir('templates', 'backend.ejs.tf'), {
      config: { ...fullConfig },
    });
    fs.writeFileSync(path.resolve(configDir, 'backend.tf'), output);
  }

  // copy all terraform modules
  fs.copySync(terraformDir('modules'), configDir, { recursive: true, overwrite: true });

  await target.provision(opts);
};

const command: CommandModule<GlobalOpts, ProvisionOpts> = {
  command: 'provision',
  describe: 'sets up the target infrastructure',
  handler,
  builder: (yargs) =>
    yargs.option('apply', {
      type: 'boolean',
      default: false,
      describe: 'Skip showing terraform plan and apply immediately',
    }),
};

export default command;
