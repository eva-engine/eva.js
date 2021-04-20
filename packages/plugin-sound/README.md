# @eva/plugin-sound

## Introduction

EVA JS 音频插件，用于为游戏对象添加音频控制的能力。插件默认使用Web audio播放。

## Usage

### Install

```bash
tnpm install @ali/eva-plugin-sound --save
```

### Import

```javascript
import { audioResource, LOAD_EVENT, Sound, SoundSystem } from '@ali/eva-plugin-sound';
```

### Use

```javascript
import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';

// 添加音频资源
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
        url:
          'https://g.alicdn.com/ltao-fe/factory/1.1.3/assets/game/sound/success.mp3',
      },
    },
    preload: true,
  },
]);

const game = new Game({
  systems: [
    new RendererSystem({
      canvas: document.querySelector('#canvas'),
      width: 750,
      height: 1000,
    }),
    new SoundSystem();
  ],
  autoStart: true,
  frameRate: 60,
});

const bgSoundObj = new GameObject('sound');
const bgSound = bgSoundObj.addComponent(
  new Sound({ resource: 'bgSound', loop: true, autoplay: true, volume: 0.5 })
);

bgSound.play();
```

### API

#### 1、Sound
##### 初始化参数：
| 参数     | 类型       | 默认值 | 说明                                 |
| -------- | ---------- | ------ | ------------------------------------ |
| resource | string     | ''     | 在audioResource注册的音频资源名称    |
| autoplay | boolean    | false  | 是否自动播放                         |
| muted    | boolean    | false  | 是否被静音                           |
| loop     | boolean    | false  | 播放结束时是否重新开始               |
| volume   | number     | 1      | 播放时的音量(整体音量) ，取值范围0-1 |
| onEnd    | () => void | -      | 播放结束时触发                       |

##### 属性：
| 参数   | 类型       | 默认值 | 说明                                                           |
| ------ | ---------- | ------ | -------------------------------------------------------------- |
| muted  | boolean    | false  | 可设置是否被静音                                               |
| volume | number     | 1      | 可设置播放时的音量，取值范围0-1                                |
| play   | () => void | -      | 尝试播放音频                                                   |
| pause  | () => void | -      | 用来暂停音频的播放，如果音频已经处于暂停状态，该方法没有效果。 |
| stop   | () => void | -      | 停止播放音频                                                   |

#### 2、SoundSystem
##### 初始化参数：
| 参数              | 类型            | 默认值 | 说明                         |
| ----------------- | --------------- | ------ | ---------------------------- |
| autoPauseAndStart | boolean         | true   | 是否和eva game同步暂停和启动 |
| onError           | (error) => void | -      | 错误处理事件                 |

##### 属性：
| 参数      | 类型       | 默认值 | 说明                                       |
| --------- | ---------- | ------ | ------------------------------------------ |
| muted     | boolean    | false  | 可设置是否被静音(所有音频)                 |
| volume    | number     | 1      | 可设置播放时的音量(整体音量) ，取值范围0-1 |
| resumeAll | () => void | -      | 恢复播放所有被暂停的音频                   |
| pauseAll  | () => void | -      | 暂停所有正在播放的音频                     |
| stopAll   | () => void | -      | 停止播放所有正在播放的音频                 |

### Tips
如果浏览器限制需要进行交互才可以开始播放音频，插件会自动尝试在页面进行交互后启用音频。