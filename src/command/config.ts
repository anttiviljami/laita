import fs from 'fs';
import { CommandModule } from 'yargs';
import YAML from 'js-yaml';
import inquirer from 'inquirer';
import Target from '../target/interface';
import { getConfigForStage, resolveRcFile, RC_FILENAME } from '../util/config';
import { GlobalOpts } from '..';

import AWSS3CloudFrontTarget from '../target/aws-s3-cloudfront';
import { checkBucketName } from '../util/s3';
import * as shell from '../util/shell';

const targets: string[] = [
  'aws-s3-cloudfront',
  'azure-storage',
  'aws-amplify',
  'netlify',
  'heroku',
  'github',
  // no-wrap
];

export interface ConfigureOpts extends GlobalOpts {}

export interface InitConfig {
  target: string;
  source: string;
}

const handler = async (opts: ConfigureOpts) => {
  const { stage } = opts;

  if (getConfigForStage(stage)) {
    console.error(`Stage "${stage}" is already initialised at ${resolveRcFile()}`);
    return process.exit(1);
  }

  const initConfig: InitConfig = await inquirer.prompt([
    { name: 'source', message: 'Static files directory?', type: 'input', default: 'public/' },
    { name: 'target', message: 'Choose method', type: 'list', choices: targets },
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

  if (!fullConfig.terraformBackend) {
    const { backend, bucket, region, createBucket } = await inquirer.prompt([
      { name: 'backend', message: 'Store terraform state remotely?', type: 'list', choices: ['local', 's3'] },
      {
        name: 'bucket',
        message: 'Terraform bucket name',
        type: 'input',
        default: 'randomly generated',
        filter: (bucket) => checkBucketName(bucket, `laita-terraform`),
        when: (a) => a.backend === 's3',
      },
      {
        name: 'region',
        message: 'Terraform bucket region',
        type: 'input',
        default: 'eu-west-1',
        when: (a) => a.backend === 's3',
      },
      {
        name: 'createBucket',
        message: 'Create bucket now?',
        type: 'confirm',
        when: (a) => a.bucket && a.region,
      },
    ]);

    if (createBucket) {
      await shell.run(
        `aws s3api create-bucket --bucket ${bucket} --region ${region} --create-bucket-configuration LocationConstraint=${region}`,
      );
    }

    fullConfig.terraformBackend = backend;
    if (backend === 's3') {
      fullConfig.terraformS3bucket = bucket;
      fullConfig.terraformS3region = region;
    }
  }

  const newConfig = { ...fullConfig, [stage]: stageConfig };

  fs.writeFileSync(configFile, YAML.safeDump(newConfig, { lineWidth: 240, noArrayIndent: true }));
  console.log(`Config written to ${configFile}`);
};

const command: CommandModule<{}, ConfigureOpts> = {
  command: 'config',
  describe: 'configures laita for this project',
  handler,
};

export default command;
