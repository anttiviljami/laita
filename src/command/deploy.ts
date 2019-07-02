import { CommandModule } from 'yargs';
import { getConfigForStage } from '../util/config';
import Target from '../target/interface';
import AWSS3CloudFront from '../target/aws-s3-cloudfront';

interface Args {
  stage: string;
}

const handler = async (args: Args) => {
  const { stage } = args;
  const config = getConfigForStage(stage);
  if (!config) {
    console.error(`No configuration found for stage ${stage}. Run laita init first`);
    process.exit(1);
  }

  const targetName = config.target;
  let target: Target | undefined;
  if (targetName === 'aws-s3-cloudfront') {
    target = new AWSS3CloudFront();
  }
  if (!target) {
    console.error('Invalid target');
    return process.exit(1);
  }

  await target.deploy(stage);
};

const command: CommandModule<{}, Args> = {
  command: 'deploy',
  describe: 'deploys public directory',
  handler,
};

export default command;
