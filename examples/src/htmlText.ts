import { RendererSystem } from '@eva/plugin-renderer';
import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { HTMLText, TextSystem } from '@eva/plugin-renderer-text';

export const name = 'HTML Text';

resource.addResource([
  {
    type: RESOURCE_TYPE.FONT,
    name: 'customFont',
    src: {
      font: {
        type: 'font',
        url:
          'https://g.alicdn.com/eva-assets/06b942920d2f310cffb0f22cc6d123ef/0.0.1/tmp/b52fe6c/1dccb0d7-0aae-4811-b763-88bee5675f65.otf?t=' +
          Date.now(),
      },
    },
    preload: true,
  },
]);

export async function init(canvas) {
  const game = new Game();
  await game.init({
    systems: [
      //@ts-ignore
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
        backgroundColor: '#f5f5f5',
      }),
      //@ts-ignore
      new TextSystem(),
    ],
  });

  game.scene.transform.size = {
    width: 750,
    height: 1000,
  };

  // // 1. 基础 HTML 文本
  // const basicHtmlText = new GameObject('basicHtmlText', {
  //   position: { x: 0, y: 80 },
  //   origin: { x: 0.5, y: 0 },
  //   anchor: { x: 0.5, y: 0 },
  // });

  // basicHtmlText.addComponent(
  //   new HTMLText({
  //     text: '<h1 style="margin:0">欢迎使用 HTMLText</h1>',
  //     style: {
  //       fontFamily: 'Arial',
  //       fontSize: 32,
  //       fill: '#ff6b6b',
  //       align: 'center',
  //     },
  //   }),
  // );

  // game.scene.addChild(basicHtmlText);

  // // 2. 富文本 - 混合样式
  // const richText = new GameObject('richText', {
  //   position: { x: 0, y: 180 },
  //   origin: { x: 0.5, y: 0 },
  //   anchor: { x: 0.5, y: 0 },
  // });

  // richText.addComponent(
  //   new HTMLText({
  //     text: `
  //       <p style="margin:0">
  //         这是<strong style="color:#e74c3c">粗体</strong>和
  //         <em style="color:#3498db">斜体</em>文本，
  //         还有<span style="text-decoration:underline">下划线</span>。
  //       </p>
  //     `,
  //     style: {
  //       fontSize: 24,
  //       fill: '#2c3e50',
  //       align: 'center',
  //       wordWrap: true,
  //       wordWrapWidth: 600,
  //     },
  //   }),
  // );

  // game.scene.addChild(richText);

  // // 3. 带 CSS 自定义样式的列表
  // const listText = new GameObject('listText', {
  //   position: { x: 100, y: 280 },
  //   origin: { x: 0, y: 0 },
  //   anchor: { x: 0, y: 0 },
  // });

  // listText.addComponent(
  //   new HTMLText({
  //     text: `
  //       <div class="title">特性列表：</div>
  //       <div class="content">
  //         <ul style="margin:10px 0;padding-left:20px">
  //           <li>✨ 支持表情符号</li>
  //           <li>🎨 自定义 CSS 样式</li>
  //           <li>📏 自动文字换行</li>
  //           <li>🚀 高性能渲染</li>
  //         </ul>
  //       </div>
  //     `,
  //     style: {
  //       fontSize: 20,
  //       fill: '#34495e',
  //       cssOverrides: [
  //         '.title { font-size: 28px; color: #9b59b6; font-weight: bold; }',
  //         '.content { line-height: 1.8; }',
  //         'li { margin: 5px 0; }',
  //       ],
  //       wordWrap: true,
  //       wordWrapWidth: 550,
  //     },
  //   }),
  // );

  // game.scene.addChild(listText);

  // // 4. 表情符号和 Unicode
  // const emojiText = new GameObject('emojiText', {
  //   position: { x: 0, y: 500 },
  //   origin: { x: 0.5, y: 0 },
  //   anchor: { x: 0.5, y: 0 },
  // });

  // emojiText.addComponent(
  //   new HTMLText({
  //     text: `
  //       <div style="text-align:center">
  //         <p style="margin:0">🎮 游戏 | 🎵 音乐 | 🎬 电影 | 📚 阅读</p>
  //         <p style="margin:10px 0">❤️ 💛 💚 💙 💜 🖤</p>
  //       </div>
  //     `,
  //     style: {
  //       fontSize: 28,
  //       fill: '#555',
  //       align: 'center',
  //     },
  //   }),
  // );

  // game.scene.addChild(emojiText);

  // // 5. 高质量渲染文本
  // const crispText = new GameObject('crispText', {
  //   position: { x: 0, y: 650 },
  //   origin: { x: 0.5, y: 0 },
  //   anchor: { x: 0.5, y: 0 },
  // });

  // crispText.addComponent(
  //   new HTMLText({
  //     text: '<div style="padding:15px;background:#ecf0f1;border-radius:8px">高清晰度文本渲染</div>',
  //     style: {
  //       fontSize: 24,
  //       fill: '#2c3e50',
  //       align: 'center',
  //     },
  //     textureStyle: {
  //       scaleMode: 'linear',
  //       resolution: 2, // 2倍分辨率，更清晰
  //     },
  //   }),
  // );

  // game.scene.addChild(crispText);

  // 6. 自定义字体
  const customFontText = new GameObject('customFontText', {
    position: { x: 0, y: 780 },
    origin: { x: 0.5, y: 0 },
    anchor: { x: 0.5, y: 0 },
  });

  const customTxt = customFontText.addComponent(
    new HTMLText({
      text: '<p style="margin:0">使用自定义字体 ¥99.99</p>',
      style: {
        fontFamily: 'customFont',
        fontSize: 36,
        fill: '#16a085',
        align: 'center',
      },
    }),
  );

  game.scene.addChild(customFontText);

  // 动态更新文本示例
  let count = 0;
  setInterval(() => {
    count++;
    customTxt.text = `<p style="margin:0">计数器: <strong style="color:#e74c3c">${count}</strong></p>`;
  }, 1000);

  // 7. 渐变效果提示
  // const gradientHint = new GameObject('gradientHint', {
  //   position: { x: 0, y: 900 },
  //   origin: { x: 0.5, y: 0 },
  //   anchor: { x: 0.5, y: 0 },
  // });

  // gradientHint.addComponent(
  //   new HTMLText({
  //     text: '<red>Red</red>,<blue>Blue</blue>,<green>Green</green>',
  //     style: {
  //       fontFamily: 'DM Sans',
  //       fill: 'white',
  //       fontSize: 100,
  //       tagStyles: {
  //         red: {
  //           fill: 'red',
  //         },
  //         blue: {
  //           fill: 'blue',
  //         },
  //         green: {
  //           fill: 'green',
  //         },
  //       },
  //     },
  //   }),
  // );

  // game.scene.addChild(gradientHint);
}
