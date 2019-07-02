import { CommandModule } from 'yargs';
import { getConfigForStage } from '../util/config';
import Target from '../target/interface';
import AWSS3CloudFrontTarget from '../target/aws-s3-cloudfront';

export interface ProvisionOpts {
  stage: string;
}

const handler = async (opts: ProvisionOpts) => {
  const { stage } = opts;
  const config = getConfigForStage(stage);
  if (!config) {
    console.error(`No configuration found for stage ${stage}. Run laita init first`);
    process.exit(1);
  }

  const targetName = config.target;
  let target: Target | undefined;
  if (targetName === 'aws-s3-cloudfront') {
    target = new AWSS3CloudFrontTarget();
  }
  if (!target) {
    console.error('Invalid target');
    return process.exit(1);
  }

  await target.provision(opts);
};

const command: CommandModule<{}, ProvisionOpts> = {
  command: 'provision',
  describe: 'sets up the target infrastructure',
  handler,
};

export default command;
