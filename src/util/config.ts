import path from 'path';
import fs from 'fs';
import { homedir } from 'os';
import YAML from 'js-yaml';

export const RC_FILENAME = '.laitarc';
export const CONFIG_DIRNAME = '.laita';

// walk backwards from cwd until homedir and check if RC_FILENAME exists
export function resolveRcFile() {
  let dir = path.resolve(process.cwd());
  while (dir.length > homedir().length) {
    const check = path.join(dir, RC_FILENAME);
    if (fs.existsSync(check)) {
      return path.join(dir, RC_FILENAME);
    } else {
      dir = path.resolve(path.join(dir, '..'));
    }
  }
}

export function getConfigForStage(stage: string) {
  if (typeof stage !== 'string' || !stage.length) {
    throw new Error('Stage mut not be empty!');
  }
  const configFile = resolveRcFile();
  if (configFile) {
    const config = YAML.safeLoad(fs.readFileSync(configFile).toString());
    return config[stage];
  }
}

export function configDir(...paths: string[]) {
  const configFile = resolveRcFile();
  const rootDir = configFile ? path.dirname(configFile) : '.';
  return path.resolve(rootDir, CONFIG_DIRNAME, ...paths);
}

let moduleDirValue: string;
export function moduleDir(...paths: string[]) {
  if (moduleDirValue) {
    return moduleDirValue;
  }
  moduleDirValue = fs.existsSync(path.resolve(__dirname, '../package.json'))
    ? path.resolve(__dirname, '..')
    : path.resolve(__dirname, '..', '..');
  return moduleDirValue;
}

export function terraformDir(...paths: string[]) {
  return path.resolve(moduleDir(), 'terraform', ...paths);
}
