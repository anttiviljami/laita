import { main } from '.';

describe('main entrypoint', () => {
  test('logs the version with no args', async () => {
    const log = console.log;
    console.log = jest.fn();
    await main();
    expect(console.log).toBeCalledTimes(1);
    console.warn = log; // reset console.warn
  });
});
