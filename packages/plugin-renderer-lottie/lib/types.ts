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
  direction?: 1 | -1;
}

export interface IOptions {
  resource: string;
  width?: number;
  height?: number;
  replaceData?: boolean;
  autoStart?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  speed?: number;
  onComplete?: () => void;
  onLoopComplete?: () => void;
}
