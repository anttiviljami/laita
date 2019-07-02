import path from 'path';

export const main = async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { version } = require(path.resolve('./package.json'));
  console.log('laita', version);
};
