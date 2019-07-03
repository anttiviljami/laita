import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import ejs from 'ejs';
import Target from '..';
import { ConfigureOpts, InitConfig } from '../../command/config';
import { ProvisionOpts } from '../../command/provision';
import { DeployOpts } from '../../command/deploy';
import { configDir as getConfigDir, getConfigForStage, terraformDir } from '../../util/config';
import * as shell from '../../util/shell';
import { checkBucketName } from '../../util/s3';

export interface AWSS3CloudFrontConfig {
  region: string;
  bucketName: string;
  createCloudFront: boolean;
  domains: string[];
  acmCertificateARN?: string;
}

export default class AWSS3CloudFrontTarget implements Target {
  public configure = async (opts: ConfigureOpts) => {
    const config: AWSS3CloudFrontConfig = await inquirer.prompt([
      { name: 'region', type: 'input', message: 'AWS Region?', default: 'eu-west-1' },
      {
        name: 'bucketName',
        type: 'input',
        message: 'S3 bucket name? (will be created)',
        default: 'randomly generated',
        filter: (name) => checkBucketName(name, `laita-static-${opts.stage}`),
      },
      {
        name: 'createCloudFront',
        type: 'confirm',
        message: 'Create CloudFront distribution? (needed to use custom domains)',
        default: false,
      },
    ]);
    config.domains = [];

    do {
      const { domain } = await inquirer.prompt([
        {
          name: 'domain',
          type: 'input',
          message: `Add ${config.domains.length > 0 ? 'another' : 'a'} domain name? (leave empty to continue)`,
          default: '',
          when: () => config.createCloudFront === true,
        },
      ]);
      if (!domain) {
        break;
      } else {
        config.domains.push(domain as string);
      }
    } while (true);

    if (config.domains.length > 0) {
      const { acmCertificateARN, useCert } = await inquirer.prompt([
        { name: 'useCert', type: 'confirm', message: 'Add ACM certificate? (needed to use custom domains)' },
        {
          name: 'acmCertificateARN',
          type: 'input',
          message: 'ACM Certificate ARN?',
          when: (answers) => answers.useCert,
        },
      ]);
      if (useCert && acmCertificateARN) {
        config.acmCertificateARN = acmCertificateARN;
      }
    }

    return config;
  };

  public provision = async (opts: ProvisionOpts) => {
    // get configuration
    const { stage } = opts;
    const config: InitConfig & AWSS3CloudFrontConfig = getConfigForStage(stage);
    console.log(`Provisioning AWS S3 + Cloudfront resources... (stage: ${opts.stage})`);

    // write terraform template
    const configDir = getConfigDir();
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

    // apply terraform
    await shell.run(`terraform apply ${opts.apply ? '-auto-approve ' : ''}${targetOpts}`, { cwd: configDir });
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
