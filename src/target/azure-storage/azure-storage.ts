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

export interface AzureStorageConfig {
  resourceGroup: string;
  storageAccount: string;
  createCDN: boolean;
}

export default class AzureStorageTarget implements Target {
  public configure = async (opts: ConfigureOpts) => {
    const config: AzureStorageConfig = await inquirer.prompt([
      {
        name: 'resourceGroup',
        type: 'input',
        message: 'Resource Group Name? (must exist in your subscription)',
      },
      {
        name: 'storageAccount',
        type: 'input',
        message: 'Storage Account Name? (will be created)',
      },
      {
        name: 'createCDN',
        type: 'confirm',
        message: 'Create a CDN endpoint? (needed to use custom domains)',
        default: false,
      },
    ]);
    return config;
  };

  public provision = async (opts: ProvisionOpts) => {
    // get configuration
    const { stage } = opts;
    const config: InitConfig & AzureStorageConfig = getConfigForStage(stage);
    console.log(`Azure storage static website resources... (stage: ${opts.stage})`);

    // write terraform template
    const configDir = getConfigDir();
    const output: string = await ejs.renderFile(terraformDir('templates', 'azure-storage.ejs.tf'), {
      opts: { ...opts, ...config },
    });
    fs.writeFileSync(path.resolve(configDir, `${stage}.tf`), output);

    // initalise terraform
    await shell.run('terraform init', { cwd: configDir });

    // only apply to modules within this stage
    const targets = [`module.azure_storage_static_${stage}`];
    if (config.createCDN) {
      targets.push(`module.azure_cdn_endpoint_${stage}`);
    }
    const targetOpts = targets.map((target) => `-target ${target}`).join(' ');

    // apply terraform
    await shell.run(`terraform apply ${opts.apply ? '-auto-approve ' : ''}${targetOpts}`, { cwd: configDir });
  };

  public deploy = async (opts: DeployOpts) => {
    // get configuration
    const config: InitConfig & AzureStorageConfig = getConfigForStage(opts.stage);
    if (!config) {
      console.error(`Configuration not found for stage ${opts.stage}`);
      return process.exit(1);
    }

    console.log(`Deploying site to Azure Blob Storage... (stage: ${opts.stage})`);
    await shell.run(`az storage blob sync --account-name '${config.storageAccount}' -c '$web' -s ${config.source}`);
  };
}
