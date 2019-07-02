import path from 'path';
import fs from 'fs';
import inquirer from 'inquirer';
import ejs from 'ejs';
import Target from '../interface';
import { InitOpts } from '../../command/init';
import { ProvisionOpts } from '../../command/provision';
import { DeployOpts } from '../../command/deploy';
import { configDir as getConfigDir, getConfigForStage, templateDir } from '../../util/config';
import * as shell from '../../util/shell';

export interface AWSS3CloudFrontConfig {
  region: string;
  bucketName: string;
  createCloudFront: boolean;
}

export default class AWSS3CloudFrontTarget implements Target {
  public configure = async (opts: InitOpts) => {
    const config: AWSS3CloudFrontConfig = await inquirer.prompt([
      { name: 'region', type: 'input', message: 'AWS Region?', default: 'eu-west-1' },
      { name: 'bucketName', type: 'input', message: 'New S3 bucket name?' },
      { name: 'createCloudFront', type: 'confirm', message: 'Create cloudfront distribution?' },
    ]);
    return config;
  };

  public provision = async (opts: ProvisionOpts) => {
    // get configuration
    const { stage } = opts;
    const config = getConfigForStage(stage);
    if (!config) {
      console.error(`Configuration not found for stage ${opts.stage}`);
      return process.exit(1);
    }

    console.log(`Provisioning AWS S3 + Cloudfront resources... (stage: ${opts.stage})`);

    // make sure config dir exists
    const configDir = getConfigDir();
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir);
    }

    // write terraform template
    const output: string = await ejs.renderFile(templateDir('aws-s3-cloudfront.ejs.tf'), {
      opts: { ...opts, ...config },
    });
    fs.writeFileSync(path.resolve(configDir, `${stage}.tf`), output);

    // initalise terraform
    await shell.run('terraform init', { cwd: configDir });

    // show terraform plan
    await shell.run('terraform plan', { cwd: configDir });

    // ask approval
    const { approve } = await inquirer.prompt([
      { name: 'approve', type: 'confirm', message: 'Apply changes?', default: true },
    ]);

    if (approve) {
      // apply terraform
      await shell.run('terraform apply -auto-approve', { cwd: configDir });
    }
  };

  public deploy = async (opts: DeployOpts) => {
    // get configuration
    const config = getConfigForStage(opts.stage);
    if (!config) {
      console.error(`Configuration not found for stage ${opts.stage}`);
      return process.exit(1);
    }

    console.log(`Deploying site to S3... (stage: ${opts.stage})`);
  };
}
