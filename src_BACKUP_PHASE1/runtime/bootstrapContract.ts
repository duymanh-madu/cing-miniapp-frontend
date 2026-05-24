export interface RuntimeBootstrapContract {
  phase: string;
  fn: () => Promise<any> | any;
  critical?: boolean;
}
