import path from 'path';
import fs from 'fs';
import { homedir } from 'os';
import YAML from 'js-yaml';

export const CONFIG_FILENAME = '.laitarc';

// walk backwards from cwd until homedir and check if CONFIG_FILENAME exists
export function resolveConfigFile() {
  let dir = path.resolve(process.cwd());
  while (dir.length > homedir().length) {
    const check = path.join(dir, CONFIG_FILENAME);
    if (fs.existsSync(check)) {
      return path.join(dir, CONFIG_FILENAME);
    } else {
      dir = path.resolve(path.join(dir, '..'));
    }
  }
}

export function getConfigForStage(stage: string) {
  if (typeof stage !== 'string' || !stage.length) {
    throw new Error('Stage mut not be empty!');
  }
  const configFile = resolveConfigFile();
  if (configFile) {
    const config = YAML.safeLoad(fs.readFileSync(configFile).toString());
    return config[stage];
  }
}
