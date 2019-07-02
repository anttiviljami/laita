export default interface Target {
  configure: (stage: string) => Promise<any>;
  provision: (stage: string) => Promise<void>;
  deploy: (stage: string) => Promise<void>;
}
