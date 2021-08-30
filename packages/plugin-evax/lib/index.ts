import EvaXComponent from './EvaXComponent';
import EvaXSystem from './EvaXSystem';
export default {
  Components: [EvaXComponent],
  Systems: [EvaXSystem],
};
export type { EvaXSystemParams } from "./EvaXSystem";
export { EvaXComponent as EvaX, EvaXSystem };
