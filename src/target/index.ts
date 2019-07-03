import { ConfigureOpts } from '../command/config';
import { ProvisionOpts } from '../command/provision';
import { DeployOpts } from '../command/deploy';
import AWSS3CloudFrontTarget from './aws-s3-cloudfront';
import AzureStorageTarget from './azure-storage';

export default interface Target {
  configure: (opts: ConfigureOpts) => Promise<any>;
  provision: (stage: ProvisionOpts) => Promise<void>;
  deploy: (stage: DeployOpts) => Promise<void>;
}

export const targets: string[] = [
  'aws-s3-cloudfront',
  'azure-storage',
  'gcp-storage',
  'netlify',
  'heroku',
  // no-wrap
];

export const resolveTarget = (target: string) => {
  if (target === 'aws-s3-cloudfront') {
    return new AWSS3CloudFrontTarget();
  }
  if (target === 'azure-storage') {
    return new AzureStorageTarget();
  }
};
