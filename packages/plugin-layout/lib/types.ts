/**
 * 归一化后的 padding 对象
 */
export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * 将 padding 输入归一化为 {top, right, bottom, left}
 */
export function normalizePadding(
  input: number | [number, number] | [number, number, number, number] | undefined,
): Padding {
  if (input == null) return { top: 0, right: 0, bottom: 0, left: 0 };
  if (typeof input === 'number') return { top: input, right: input, bottom: input, left: input };
  if (input.length === 2) return { top: input[0], right: input[1], bottom: input[0], left: input[1] };
  return { top: input[0], right: input[1], bottom: input[2], left: input[3] };
}
