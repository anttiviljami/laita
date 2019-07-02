export default interface Target {
  configure: () => Promise<any>;
}
