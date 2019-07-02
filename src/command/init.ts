import fs from 'fs';
import { CommandModule } from 'yargs';
import YAML from 'js-yaml';
import inquirer from 'inquirer';
import Target from '../target/interface';
import AWSS3CloudFrontTarget from '../target/aws-s3-cloudfront';
import { getConfigForStage, resolveRcFile, RC_FILENAME } from '../util/config';

export interface InitOpts {
  stage: string;
}

const handler = async (opts: InitOpts) => {
  const { stage } = opts;

  if (getConfigForStage(stage)) {
    console.error(`Stage "${stage}" is already initialised at ${resolveRcFile()}`);
    return process.exit(1);
  }

  const { name, source } = await inquirer.prompt([
    { name: 'name', message: 'Choose target', type: 'list', choices: ['aws-s3-cloudfront'] },
    { name: 'source', message: 'Local directory for static files?', type: 'input', default: 'public/' },
  ]);

  let target: Target | undefined;
  if (name === 'aws-s3-cloudfront') {
    target = new AWSS3CloudFrontTarget();
  }
  if (!target) {
    console.error('Invalid target');
    return process.exit(1);
  }

  const config = await target.configure(opts);
  const stageConfig = { target: name, source, ...config };

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
