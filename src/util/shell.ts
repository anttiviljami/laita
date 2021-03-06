import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

export async function run(command: string, opts: SpawnOptionsWithoutStdio = {}) {
  return new Promise((resolve, reject) => {
    console.log(`----> Running "${command}"...`);
    const child = spawn(command, { shell: true, stdio: 'inherit', ...opts });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
}
