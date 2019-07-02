import { InitOpts } from '../command/init';
import { ProvisionOpts } from '../command/provision';
import { DeployOpts } from '../command/deploy';

export default interface Target {
  configure: (opts: InitOpts) => Promise<any>;
  provision: (stage: ProvisionOpts) => Promise<void>;
  deploy: (stage: DeployOpts) => Promise<void>;
}
