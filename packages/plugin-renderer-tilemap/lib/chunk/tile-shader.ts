/**
 * Tile mesh shader 源码(G3)。
 *
 * PIXI v8 用 ProgramSource + Geometry,程序员手工写 GLSL 即可。这里 vert/frag
 * 走 packed vertex attribute,flip/transpose 在 vertex 阶段通过 mat2 完成。
 *
 * Attribute 布局(每 vertex 32 bytes):
 *   aPosition vec2 (8B)  cell 左上 + 局部偏移
 *   aTexCoord vec2 (8B)  atlas UV 0..1
 *   aFlags    vec4 (16B) [flipH, flipV, transpose, animPhase]
 */

export const TILE_VERT_SHADER = `#version 300 es
precision highp float;

in vec2 aPosition;
in vec2 aTexCoord;
in vec4 aFlags;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;

out vec2 vTexCoord;

void main() {
  vec3 worldPos = uWorldTransformMatrix * vec3(aPosition, 1.0);
  gl_Position = vec4((uProjectionMatrix * worldPos).xy, 0.0, 1.0);

  vec2 uv = aTexCoord;
  if (aFlags.x > 0.5) uv.x = 1.0 - uv.x;
  if (aFlags.y > 0.5) uv.y = 1.0 - uv.y;
  if (aFlags.z > 0.5) { float t = uv.x; uv.x = uv.y; uv.y = t; }
  vTexCoord = uv;
}
`;

export const TILE_FRAG_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform sampler2D uTexture;
uniform vec4 uModulate;

void main() {
  vec4 sampled = texture(uTexture, vTexCoord);
  fragColor = sampled * uModulate;
  if (fragColor.a < 0.01) discard;
}
`;

/**
 * 包成 PIXI.GlProgram options 形式 — host 用 `new Program({glProgram: ...})` 创建。
 */
export interface TileShaderSources {
	vertex: string;
	fragment: string;
}

export const TILE_SHADER_SOURCES: TileShaderSources = {
	vertex: TILE_VERT_SHADER,
	fragment: TILE_FRAG_SHADER,
};
