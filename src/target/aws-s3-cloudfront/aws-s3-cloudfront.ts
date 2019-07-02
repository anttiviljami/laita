import Target from '../interface';
import inquirer from 'inquirer';

export interface AWSS3CloudFrontConfig {
  createCloudFront: boolean;
}

export default class AWSS3CloudFront implements Target {
  public configure = async () => {
    const config: AWSS3CloudFrontConfig = await inquirer.prompt([
      { name: 'createCloudFront', type: 'confirm', message: 'Create cloudfront distribution?' },
    ]);
    return config;
  };
}
