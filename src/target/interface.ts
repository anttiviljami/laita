import { ConfigureOpts } from '../command/config';
import { ProvisionOpts } from '../command/provision';
import { DeployOpts } from '../command/deploy';

export default interface Target {
  configure: (opts: ConfigureOpts) => Promise<any>;
  provision: (stage: ProvisionOpts) => Promise<void>;
  deploy: (stage: DeployOpts) => Promise<void>;
}
