import fs from 'fs';
import { CommandModule } from 'yargs';
import YAML from 'js-yaml';
import inquirer from 'inquirer';
import Target from '../target/interface';
import { getConfigForStage, resolveRcFile, RC_FILENAME } from '../util/config';
import { GlobalOpts } from '..';

import AWSS3CloudFrontTarget from '../target/aws-s3-cloudfront';

const targets: string[] = [
  'aws-s3-cloudfront',
  'azure-storage',
  'aws-amplify',
  'netlify',
  'heroku',
  'github',
  // no-wrap
];

export interface InitOpts extends GlobalOpts {}

export interface InitConfig {
  target: string;
  source: string;
}

const handler = async (opts: InitOpts) => {
  const { stage } = opts;

  if (getConfigForStage(stage)) {
    console.error(`Stage "${stage}" is already initialised at ${resolveRcFile()}`);
    return process.exit(1);
  }

  const initConfig: InitConfig = await inquirer.prompt([
    { name: 'target', message: 'Choose target', type: 'list', choices: targets },
    { name: 'source', message: 'Local directory for static files?', type: 'input', default: 'public/' },
  ]);

  let target: Target | undefined;
  if (initConfig.target === 'aws-s3-cloudfront') {
    target = new AWSS3CloudFrontTarget();
  }
  if (!target) {
    console.error('Target not available');
    return process.exit(1);
  }

  const config = await target.configure(opts);
  const stageConfig = { ...initConfig, ...config };

  const configFile = resolveRcFile() || RC_FILENAME;
  const fullConfig = fs.existsSync(configFile) ? YAML.safeLoad(fs.readFileSync(configFile).toString()) : {};
  const newConfig = { ...fullConfig, [stage]: stageConfig };

  fs.writeFileSync(configFile, YAML.safeDump(newConfig, { lineWidth: 240, noArrayIndent: true }));
  console.log(`Config written to ${configFile}`);
};

const command: CommandModule<{}, InitOpts> = {
  command: 'init',
  describe: 'configures laita for this project',
  handler,
};

export default command;
