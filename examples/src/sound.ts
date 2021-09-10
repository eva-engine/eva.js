import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { Event, EventSystem } from "@eva/plugin-renderer-event";
import { Text, TextSystem } from "@eva/plugin-renderer-text";
import { Sound, SoundSystem } from "@eva/plugin-sound";

export const name = 'sound';
export async function init(canvas) {
  resource.addResource([
    {
      name: 'bgSound',
      type: RESOURCE_TYPE.AUDIO,
      src: {
        audio: {
          type: 'audio',
          url: 'https://g.alicdn.com/ltao-fe/duck_assets/0.0.1/assets/duckBg.mp3',
        },
      },
      preload: true,
    },
    {
      name: 'successSound',
      src: {
        audio: {
          type: 'audio',
          url: 'https://g.alicdn.com/ltao-fe/factory/1.1.3/assets/game/sound/success.mp3',
        },
      },
      preload: true,
    },
  ]);

  window.resource = resource

  const soundSystem = new SoundSystem();
  const game = new Game({
    systems: [
      new RendererSystem({
        canvas: document.querySelector('#canvas'),
        width: 750,
        height: 1000,
      }),
      new TextSystem(),
      new EventSystem(),
      // init SoundSystem
      soundSystem,
    ],
    autoStart: true,
    frameRate: 60,
  });

  // 此处还在考虑如何设置默认场景的宽高
  game.scene.transform.size = {
    width: 750,
    height: 1000,
  };

  // add Sound Component
  const bgSoundObj = new GameObject('sound');
  const bgSound = bgSoundObj.addComponent(new Sound({ resource: 'bgSound', loop: true, autoplay: true, volume: 0.5 }));

  //   const playerA = new GameObject('playerA');
  //   const audioSampleA = playerA.addComponent(new Sound({resource: 'successSound', autoplay: true, seek: 1.3, duration: 2}));

  const successSoundObj = new GameObject('succedSound');
  const successSound = successSoundObj.addComponent(new Sound({ resource: 'successSound' }));

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      game.pause();
    } else {
      game.resume();
    }
  });

  function createText(name, text, position = { x: 0, y: 0 }) {
    const textObject = new GameObject(name, {
      position,
      origin: {
        x: 0,
        y: 0,
      },
      anchor: {
        x: 0,
        y: 0,
      },
    });
    textObject.addComponent(
      new Text({
        text,
        style: {
          fontSize: 36,
          fill: ['#ffffff'],
        },
      }),
    );
    return textObject;
  }

  const textPlay = createText('textPlay', 'play bgSound', {
    x: 0,
    y: 50,
  });
  game.scene.addChild(textPlay);
  const textPlayEvt = textPlay.addComponent(new Event());
  textPlayEvt.on('tap', () => {
    bgSound.play();
  });

  const textPause = createText('textPause', 'pause bgSound', {
    x: 0,
    y: 100,
  });
  game.scene.addChild(textPause);
  const textPauseEvt = textPause.addComponent(new Event());
  textPauseEvt.on('tap', () => {
    bgSound.pause();
  });

  const textStop = createText('textStop', 'stop bgSound', {
    x: 0,
    y: 150,
  });
  game.scene.addChild(textStop);
  const textStopEvt = textStop.addComponent(new Event());
  textStopEvt.on('tap', () => {
    bgSound.stop();
  });

  const textMutedBgSound = createText('textMutedBgSound', 'muted bgSound', {
    x: 0,
    y: 200,
  });
  game.scene.addChild(textMutedBgSound);
  const textMutedBgSoundEvt = textMutedBgSound.addComponent(new Event());
  textMutedBgSoundEvt.on('tap', () => {
    bgSound.muted = !bgSound.muted;
  });

  const textMutedSystem = createText('textMutedSystem', 'muted system', {
    x: 0,
    y: 250,
  });
  game.scene.addChild(textMutedSystem);
  const textMutedSystemEvt = textMutedSystem.addComponent(new Event());
  textMutedSystemEvt.on('tap', () => {
    soundSystem.muted = !soundSystem.muted;
  });

  const textPlaySuccess = createText('textPlaySuccess', 'play success sound', {
    x: 0,
    y: 300,
  });
  game.scene.addChild(textPlaySuccess);
  const textPlaySuccessEvt = textPlaySuccess.addComponent(new Event());
  textPlaySuccessEvt.on('tap', () => {
    successSound.play();
  });

  const textSetSystemVolume = createText('textSetSystemVolume', 'set system volume(1/0.5)', {
    x: 0,
    y: 350,
  });
  game.scene.addChild(textSetSystemVolume);
  const textSetSystemVolumeEvt = textSetSystemVolume.addComponent(new Event());
  textSetSystemVolumeEvt.on('tap', () => {
    if (soundSystem.volume === 1) {
      soundSystem.volume = 0.5;
    } else {
      soundSystem.volume = 1;
    }
  });

  const textSetBgSoundVolume = createText('textSetBgSoundVolume', 'set bgSound volume(1/0.5)', {
    x: 0,
    y: 400,
  });
  game.scene.addChild(textSetBgSoundVolume);
  const textSetBgSoundVolumeEvt = textSetBgSoundVolume.addComponent(new Event());
  textSetBgSoundVolumeEvt.on('tap', () => {
    if (bgSound.volume === 1) {
      bgSound.volume = 0.5;
    } else {
      bgSound.volume = 1;
    }
  });

  const text = new GameObject('text', {
    position: {
      x: 0,
      y: 0,
    },
    origin: {
      x: 0,
      y: 0,
    },
    anchor: {
      x: 0,
      y: 0,
    },
  });

  text.addComponent(
    new Text({
      text: 'Hello EVA Sound Plugin!',
      style: {
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff', '#00ff99', '#00ffff'], // gradient
        fillGradientType: 1,
        fillGradientStops: [0.1, 0.4],
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 750,
        breakWords: true,
      },
    }),
  );

  game.scene.addChild(text);
}