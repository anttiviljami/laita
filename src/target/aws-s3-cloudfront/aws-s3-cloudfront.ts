import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import ejs from 'ejs';
import Target from '../interface';
import { InitOpts, InitConfig } from '../../command/init';
import { ProvisionOpts } from '../../command/provision';
import { DeployOpts } from '../../command/deploy';
import { configDir as getConfigDir, getConfigForStage, terraformDir } from '../../util/config';
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
    const config: InitConfig & AWSS3CloudFrontConfig = getConfigForStage(stage);
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

    // copy all terraform modules
    fs.copySync(terraformDir('modules'), configDir, { recursive: true, overwrite: true });

    // write terraform template
    const output: string = await ejs.renderFile(terraformDir('templates', 'aws-s3-cloudfront.ejs.tf'), {
      opts: { ...opts, ...config },
    });
    fs.writeFileSync(path.resolve(configDir, `${stage}.tf`), output);

    // initalise terraform
    await shell.run('terraform init', { cwd: configDir });

    // only apply to modules within this stage
    const targets = [`module.s3_website_${stage}`];
    if (config.createCloudFront) {
      targets.push(`module.cloudfront_distribution_${stage}`);
    }
    const targetOpts = targets.map((target) => `-target ${target}`).join(' ');

    if (!opts.apply) {
      // show terraform plan
      await shell.run(`terraform plan ${targetOpts}`, { cwd: configDir });

      // ask approval
      const { approve } = await inquirer.prompt([
        { name: 'approve', type: 'confirm', message: 'Apply changes?', default: true },
      ]);

      // exit if not approved
      if (!approve) {
        return;
      }
    }

    // apply terraform
    await shell.run(`terraform apply -auto-approve ${targetOpts}`, { cwd: configDir });
  };

  public deploy = async (opts: DeployOpts) => {
    // get configuration
    const config: InitConfig & AWSS3CloudFrontConfig = getConfigForStage(opts.stage);
    if (!config) {
      console.error(`Configuration not found for stage ${opts.stage}`);
      return process.exit(1);
    }

    console.log(`Deploying site to S3... (stage: ${opts.stage})`);
    await shell.run(`aws s3 sync --delete ${config.source} s3://${config.bucketName}`);
  };
}
