import yargs from 'yargs';
import { cmd } from '.';

describe('main entrypoint', () => {
  test('shows help when no command is provided', async () => {
    const log = console.log;
    console.log = jest.fn();
    await cmd(yargs(['--help']).exitProcess(false)).argv;
    expect(console.log).toBeCalledTimes(1);
    console.warn = log; // reset console.warn
  });
});
