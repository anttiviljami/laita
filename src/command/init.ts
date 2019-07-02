import fs from 'fs';
import { CommandModule } from 'yargs';
import YAML from 'js-yaml';
import inquirer from 'inquirer';
import Target from '../target/interface';
import AWSS3CloudFront from '../target/aws-s3-cloudfront';
import { getConfigForStage, resolveConfigFile, CONFIG_FILENAME } from '../util/config';

interface Args {
  stage: string;
}

const handler = async (args: Args) => {
  const { stage } = args;

  if (getConfigForStage(stage)) {
    console.error(`Stage "${stage}" is already initialised at ${resolveConfigFile()}`);
    return process.exit(1);
  }

  const { name, source } = await inquirer.prompt([
    { name: 'name', message: 'Choose target', type: 'list', choices: ['aws-s3-cloudfront'] },
    { name: 'source', message: 'Local directory for static files?', type: 'input', default: 'public/' },
  ]);

  let target: Target | undefined;
  if (name === 'aws-s3-cloudfront') {
    target = new AWSS3CloudFront();
  }
  if (!target) {
    console.error('Invalid target');
    return process.exit(1);
  }

  const config = await target.configure(stage);
  const stageConfig = { target: name, source, ...config };

  const configFile = resolveConfigFile() || CONFIG_FILENAME;
  const fullConfig = fs.existsSync(configFile) ? YAML.safeLoad(fs.readFileSync(configFile).toString()) : {};
  const newConfig = { ...fullConfig, [stage]: stageConfig };

  fs.writeFileSync(configFile, YAML.safeDump(newConfig, { lineWidth: 240, noArrayIndent: true }));
  console.log(`Config written to ${configFile}`);
};

const command: CommandModule<{}, Args> = {
  command: 'init',
  describe: 'configures laita for this project',
  handler,
};

export default command;
