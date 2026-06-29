/**
 * Body source registry shim(G1)。
 *
 * 真实 plugin-matterjs `registerBodySource` API 落地需要 ADR-0019 评审 + BREAKING
 * change。这里先 ship 一个完全相同的抽象层,plugin-renderer-tilemap 内部用它建
 * TileMapStaticBody body 集合。host 在初始化时把这个 registry 喂给 plugin-matterjs
 * (或直接消费它建 Matter.Composite)。
 *
 * 当 ADR-0019 落地后,只需要把这里的 import 切到 @eva/plugin-matterjs/lib/body-source。
 */

export interface BodyVec2 {
	x: number;
	y: number;
}

export interface BodyDefinition {
	id: string;
	/** 局部顶点 — Matter.js 会用 fromVertices 构建 polygon body。 */
	vertices: BodyVec2[];
	/** body 中心(world coords)。 */
	centerX: number;
	centerY: number;
	isStatic: boolean;
	friction?: number;
	restitution?: number;
	oneWay?: boolean;
	categoryFilter?: number;
	maskFilter?: number;
	metadata?: Record<string, unknown>;
}

export interface BodySourceContext {
	worldX: number;
	worldY: number;
}

export type BodySourceBuilder = (ctx: BodySourceContext) => BodyDefinition[];

class BodySourceRegistryImpl {
	private builders = new Map<string, BodySourceBuilder>();

	register(name: string, builder: BodySourceBuilder): void {
		this.builders.set(name, builder);
	}

	unregister(name: string): void {
		this.builders.delete(name);
	}

	has(name: string): boolean {
		return this.builders.has(name);
	}

	build(name: string, ctx: BodySourceContext): BodyDefinition[] | null {
		const b = this.builders.get(name);
		if (!b) return null;
		return b(ctx);
	}

	listRegisteredNames(): string[] {
		return Array.from(this.builders.keys());
	}

	clear(): void {
		this.builders.clear();
	}
}

export const TILEMAP_BODY_SOURCE_REGISTRY = new BodySourceRegistryImpl();
