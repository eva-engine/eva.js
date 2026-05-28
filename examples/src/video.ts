import { RendererSystem } from '@eva/plugin-renderer';
import { Game, GameObject } from '@eva/eva.js';
import { Video, VideoSystem } from '@eva/plugin-renderer-video';

export const name = 'video';

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
        backgroundColor: 0x101010,
      }),
      new VideoSystem(),
    ],
  });

  const videoGo = new GameObject('video', {
    position: { x: 375, y: 500 },
    anchor: { x: 0.5, y: 0.5 },
  });
  const video = new Video({
    src: '/phaser-assets/video/clouds.webm',
    loop: true,
    muted: true,
    autoplay: true,
    width: 700,
    height: 400,
  });
  videoGo.addComponent(video);
  game.scene.addChild(videoGo);

  // @ts-ignore
  window.test = () => {
    if (!video.videoElement) return;
    if (video.videoElement.paused) video.play();
    else video.pause();
  };
}
