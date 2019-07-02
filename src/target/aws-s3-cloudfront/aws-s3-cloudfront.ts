import Target from '../interface';
import inquirer from 'inquirer';

export interface AWSS3CloudFrontConfig {
  createCloudFront: boolean;
}

export default class AWSS3CloudFront implements Target {
  public configure = async (stage: string) => {
    const config: AWSS3CloudFrontConfig = await inquirer.prompt([
      { name: 'createCloudFront', type: 'confirm', message: 'Create cloudfront distribution?' },
    ]);
    return config;
  };

  public provision = async (stage: string) => {
    console.log(`Provisioning AWS S3 + Cloudfront resources... (stage: ${stage})`);
  };

  public deploy = async (stage: string) => {
    console.log(`Deploying site to S3... (stage: ${stage})`);
  };
}
