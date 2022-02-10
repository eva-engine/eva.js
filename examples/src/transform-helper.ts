import { RendererSystem } from "@eva/plugin-renderer";
import { Game, GameObject, RESOURCE_TYPE, resource, TransformParams, UpdateParams } from "@eva/eva.js"
import { Img, ImgSystem } from "@eva/plugin-renderer-img";
import { EvaTransformHelper } from "../../packages/helpers/lib";
export const name = 'transform-helper';
export async function init(canvas) {
	resource.addResource([
		{
			name: 'imageName',
			type: RESOURCE_TYPE.IMAGE,
			src: {
				image: {
					type: 'png',
					url: 'https://gw.alicdn.com/tfs/TB1DNzoOvb2gK0jSZK9XXaEgFXa-658-1152.webp',
				},
			},
			preload: true,
		},
	]);
	const game = new Game({
		systems: [
			new RendererSystem({
				canvas,
				width: 750,
				height: 1000,
			}),
			new ImgSystem(),
		],
	});
	const helpler = new EvaTransformHelper(game.getSystem(RendererSystem).containerManager, game.scene);

	const image = new GameObject('image', {
		size: { width: 200, height: 300 },
		origin: { x: 0.35, y: 0.45 },
		position: {
			x: 551,
			y: 229,
		},
		anchor: {
			x: 0.5,
			y: 0.1,
		},
		rotation: 1
	});

	image.addComponent(
		new Img({
			resource: 'imageName',
		}),
	);

	game.scene.addChild(image);

	window.onclick = () => {

		const newParent = new GameObject('newP', {
			size: { width: 6540, height: 1300 },
			origin: { x: 1, y: 1.45 },
			position: {
				x: 51,
				y: -220,
			},
			anchor: {
				x: 5,
				y: 1.1,
			},
			rotation: 20
		});
		game.scene.addChild(newParent);

		/**
		 * 强制Game对象刷新一次
		 */
		const options: UpdateParams = {
			deltaTime: 16,
			time: 0,
			currentTime: 0,
			// @ts-ignore
			frameCount: ++game.ticker._frameCount,
			fps: 60,
		};
		// @ts-ignore
		for (const func of game.ticker._tickers) {
			// @ts-ignore
			func(options);
		}


		const transform = helpler.calculateTransformWhenChangeParent(image, newParent);

		const newImage = createImage(transform);

		image.destroy();

		// 计时器使变化可观测
		setTimeout(() => {
			newParent.addChild(newImage);
		}, 100)

	}

}

function createImage(transform: TransformParams) {

	const image = new GameObject('image', transform);

	image.addComponent(
		new Img({
			resource: 'imageName',
		}),
	);
	return image;
}