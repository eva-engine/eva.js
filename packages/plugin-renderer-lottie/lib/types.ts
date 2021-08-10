export interface IExpandOpts {
  repeats?: number;
  infinite?: boolean;
  slot?: Array<{
    name: string;
    type: 'TEXT' | 'IMAGE';
    value: string;
    style: {
      [key: string]: any;
    };
  }>;
}

export interface IOptions {
  resource: string;
  width?: number;
  height?: number;
}
