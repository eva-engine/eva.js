import {
  Game,
  GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { Text,
  TextSystem } from '@eva/plugin-renderer-text';
import { RenderSystem } from '@eva/plugin-renderer-render';
import { Dialog,
  UISystem,
} from '@eva/plugin-ui';
import {
  makeRoundedRect,
  makeStoryLabel,
  pixiDefaultTextStyle,
  pixiStoryColors,
  preloadPixiStoryAssets,
  registerPixiStoryAssets,
} from './plugin-ui-pixi-stories/helpers';

export const name = 'plugin-ui-pixi-stories-dialog';

const CW = 750;
const CH = 1000;

export async function init(canvas: HTMLCanvasElement) {
  registerPixiStoryAssets();
  await preloadPixiStoryAssets(['button.png', 'button_hover.png', 'button_pressed.png', 'button_gray.png']);

  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: CW, height: CH }),
      new GraphicsSystem(),
      new TextSystem(),
      new RenderSystem(),
      new UISystem(),
    ],
  });

  game.scene.addChild(makeRoundedRect('bg', 0, 0, CW, CH, 0, '#111827'));
  game.scene.addChild(makeStoryLabel('title', 32, 28, '@pixi/ui Dialog stories'));

  game.scene.addChild(makeStoryTag('graphics-label', 56, 86, 'DialogGraphics/SimpleAlert'));
  game.scene.addChild(makeSimpleAlertDialog('graphics-alert', 220, 265));

  game.scene.addChild(makeStoryTag('nine-label', 448, 86, 'DialogNineSlice/NineSliceBackground'));
  game.scene.addChild(makeNineSliceDialog('nine-slice', 560, 265));

  game.scene.addChild(makeStoryTag('confirm-label', 54, 545, 'DialogGraphics/ConfirmDialog'));
  game.scene.addChild(makeConfirmDialog('confirm', 220, 745));

  game.scene.addChild(makeStoryTag('sprite-label', 445, 545, 'DialogSprite/LetterGridSelector'));
  game.scene.addChild(makeLetterDialog('letters', 560, 745));
}

function makeStoryTag(name: string, x: number, y: number, text: string): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 280, height: 24 } });
  go.addComponent(new Text({
    text,
    style: { fontSize: 14, fill: '#cbd5e1', fontWeight: '700' } as any,
  }));
  return go;
}

export function makeSimpleAlertDialog(name: string, x: number, y: number, exact = false): GameObject {
  const width = exact ? 400 : 320;
  const height = exact ? 300 : 250;
  const okButton = dialogButton('OK', 150, 40, 20, exact ? 21.25 : 18, exact ? 'button' : 'fancy');
  return makeDialog(name, x, y, {
    ...exactDialogProps(exact),
    width,
    height,
    padding: 20,
    backgroundView: panelBackground(width, height, 20),
    title: 'Title',
    titleStyle: titleStyle(exact ? 23.5 : 24),
    content: exact ? loremText : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae justo at orci luctus.',
    contentStyle: exact ? {
      ...contentStyle(width - 60),
      lineHeight: 20,
      fill: 0xf0f0f0,
      dropShadow: {
        ...pixiDefaultTextStyle.dropShadow,
        alpha: 1,
      },
    } : contentStyle(width - 60),
    buttons: [okButton],
    buttonList: { elementsMargin: 40 },
    ...(exact ? {
      buttonListOffset: { y: -1 },
      scrollBox: { offset: { y: 0.1669921875 }, size: { height: 190 } },
    } : {}),
  });
}

export function makeNineSliceDialog(name: string, x: number, y: number, exact = false): GameObject {
  const width = exact ? 488 : 260;
  const height = exact ? 340 : 220;
  const button = exact
    ? dialogSpriteButton('👍 Amazing!', 314, 82, { fontSize: 27.2 })
    : dialogButton('👍 OK', 140, 48);
  return makeDialog(name, x, y, {
    ...exactDialogProps(exact),
    width,
    height,
    padding: exact ? 30 : 24,
    backgroundView: { texture: 'button_gray.png' },
    nineSliceSprite: [25, 20, 25, 20],
    title: exact ? 'Fancy Dialog' : 'Fancy',
    titleStyle: titleStyle(exact ? 23.35 : 24),
    content: exact ? 'This dialog has a scalable border!' : 'Scalable border',
    contentStyle: exact ? {
      ...defaultDialogTextStyle(15.6),
      fill: 0xf4f4f4,
      dropShadow: undefined,
    } : contentStyle(width - 56),
    buttons: [button],
    ...(exact ? { buttonListOffset: { y: 2 } } : {}),
  });
}

export function makeConfirmDialog(name: string, x: number, y: number, exact = false): GameObject {
  const width = exact ? 400 : 330;
  const height = exact ? 300 : 260;
  return makeDialog(name, x, y, {
    ...exactDialogProps(exact),
    width,
    height,
    padding: exact ? 20 : 24,
    backgroundView: panelBackground(width, height, 20),
    title: 'Confirm Action',
    titleStyle: exact ? titleStyle(24, 44) : titleStyle(24),
    content: 'Are you sure you want to proceed?',
    contentStyle: exact ? confirmContentStyle(width - 40) : contentStyle(width - 64),
    buttons: [
      dialogButton('✖ Cancel', exact ? 110 : 120, exact ? 50 : 46),
      dialogButton('✓ Confirm', exact ? 110 : 130, exact ? 50 : 46),
    ],
    buttonList: { elementsMargin: exact ? 40 : 18 },
  });
}

export function makeThreeButtonsDialog(name: string, x: number, y: number, exact = false): GameObject {
  const width = exact ? 400 : 330;
  const height = exact ? 300 : 260;
  return makeDialog(name, x, y, {
    ...exactDialogProps(exact),
    width,
    height,
    padding: exact ? 20 : 24,
    backgroundView: panelBackground(width, height, 20),
    title: 'Choose Action',
    titleStyle: exact ? titleStyle(24, 44) : titleStyle(24),
    content: 'What would you like to do?',
    contentStyle: exact ? defaultDialogTextStyle(16) : contentStyle(width - 64),
    buttons: [
      dialogButton('Yes', 90, exact ? 50 : 46),
      dialogButton('No', 90, exact ? 50 : 46),
      dialogButton('Cancel', 90, exact ? 50 : 46),
    ],
    buttonList: { elementsMargin: exact ? 40 : 16 },
  });
}

export function makeNineSliceConfirmDialog(name: string, x: number, y: number, exact = false): GameObject {
  const width = exact ? 500 : 330;
  const height = exact ? 350 : 260;
  return makeDialog(name, x, y, {
    ...exactDialogProps(exact),
    width,
    height,
    padding: exact ? 30 : 24,
    backgroundView: { texture: 'button_gray.png' },
    nineSliceSprite: [25, 20, 25, 20],
    title: 'Confirm Action',
    titleStyle: titleStyle(24),
    content: 'Are you sure you want to proceed?',
    contentStyle: exact ? defaultDialogTextStyle(16) : contentStyle(width - 64),
    buttons: [
      exact
        ? dialogButton('✖ Cancel', 110, 50, 50, 17.55, 'fancy', { hoverY: -2 })
        : dialogButton('✖ Cancel', 120, 46),
      exact
        ? dialogButton('✓ Confirm', 110, 50, 50, 17.55, 'fancy', { hoverY: -2 })
        : dialogButton('✓ Confirm', 130, 46),
    ],
    buttonList: { elementsMargin: exact ? 10 : 18 },
  });
}

export function makeLetterDialog(name: string, x: number, y: number, exact = false): GameObject {
  const width = exact ? 500 : 330;
  const height = exact ? 420 : 260;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  if (exact) {
    return makeDialog(name, x, y, {
      ...exactDialogProps(exact),
      width,
      height,
      padding: 35,
      backgroundView: panelBackground(width, height, 20, false),
      title: 'Select a letter',
      titleStyle: titleStyle(24, 44),
      contentButtons: letters.map((letter) => letterButton(letter)),
      scrollBox: { type: 'bidirectional', elementsMargin: 10, padding: 10 },
    });
  }
  return makeDialog(name, x, y, {
    width,
    height,
    padding: 24,
    backgroundView: panelBackground(width, height, 20),
    title: 'Select a letter',
    titleStyle: titleStyle(24),
    contentButtons: letters.map((letter) => letterButton(letter, 34, 18)),
    scrollBox: { type: 'bidirectional', elementsMargin: 5, padding: 4 },
  });
}

export function makeCheckboxSwapDialog(name: string, x: number, y: number, exact = false): GameObject {
  const width = exact ? 450 : 330;
  const height = exact ? 400 : 260;
  if (exact) {
    const letters = 'ABCDEFGHIJ'.split('');
    return makeDialog(name, x, y, {
      ...exactDialogProps(exact),
      width,
      height,
      padding: 20,
      backgroundView: panelBackground(width, height, 20, false),
      title: 'Swap letters',
      titleStyle: titleStyle(24),
      contentCheckBoxes: letters.map((letter) => ({
        text: letter,
        size: 30,
        radius: 5,
        uncheckedColor: pixiStoryColors.pannelBorderColor,
        checkedColor: pixiStoryColors.color,
        strokeColor: pixiStoryColors.textColor,
        strokeWidth: 2,
        textStyle: {
          fontSize: 20,
          fill: pixiStoryColors.textColor,
        },
      })),
      buttons: [
        dialogButton('Cancel', 100, 40, 10, 20),
        {
          ...dialogButton('Swap', 100, 40, 10, 20),
          disabled: true,
          disabledColor: pixiStoryColors.disabledColor,
        },
      ],
      scrollBox: { type: 'bidirectional', elementsMargin: 50, vertPadding: 30 },
      buttonList: { elementsMargin: 10 },
    });
  }
  return makeDialog(name, x, y, {
    width,
    height,
    padding: 20,
    backgroundView: panelBackground(width, height, 20, !exact),
    title: 'Swap letters',
    titleStyle: titleStyle(24),
    content: '☐ A     ☐ B     ☐ C\n☐ D     ☐ E     ☐ F\n☐ G     ☐ H     ☐ I\n☐ J',
    contentStyle: { ...contentStyle(width - 64), fontSize: 20, lineHeight: 26 },
    buttons: [
      dialogButton('Cancel', 100, 42),
      { ...dialogButton('Swap', 100, 42), disabled: true, color: pixiStoryColors.disabledColor },
    ],
    buttonList: { elementsMargin: 12 },
  });
}

function makeDialog(name: string, x: number, y: number, props: Record<string, unknown>): GameObject {
  const { width, height, ...componentProps } = props;
  const transformWidth = Number(width) || 1;
  const transformHeight = Number(height) || 1;
  const go = new GameObject(name, { position: { x, y }, size: { width: transformWidth, height: transformHeight } });
  go.addComponent(new (Dialog as any)({
    open: true,
    backdropColor: '#000000',
    backdropAlpha: 0.03,
    closeOnBackdropClick: false,
    scrollBox: { background: pixiStoryColors.pannelColor, padding: 10, elementsMargin: 10 },
    animations: {
      open: { props: {}, duration: 300 },
      close: { props: {}, duration: 300 },
    },
    ...componentProps,
  } as any));
  return go;
}

function exactDialogProps(exact: boolean): Record<string, unknown> {
  return exact ? { backdropAlpha: 0.5, scrollBox: { background: undefined } } : {};
}

function panelBackground(width: number, height: number, radius: number, stroke = true) {
  return { shape: {
      type: 'roundedRect',
      style: {
        width,
        height,
        radius,
        fill: pixiStoryColors.pannelColor,
        ...(stroke ? { stroke: pixiStoryColors.pannelBorderColor, lineWidth: 1 } : {}),
      },
    },
  };
}

function titleStyle(fontSize: number, lineHeight?: number) {
  return {
    ...pixiDefaultTextStyle,
    fontSize,
    fontWeight: 'bold',
    fill: pixiDefaultTextStyle.fill,
    ...(lineHeight ? { lineHeight } : {}),
  };
}

function contentStyle(wordWrapWidth: number) {
  return {
    ...pixiDefaultTextStyle,
    fontSize: 16,
    fontWeight: 'normal',
    align: 'center' as const,
    wordWrapWidth,
    wordWrap: true,
    lineHeight: 22,
    fill: pixiDefaultTextStyle.fill,
  };
}

function defaultDialogTextStyle(fontSize: number) {
  return {
    ...pixiDefaultTextStyle,
    fontSize,
    fill: pixiDefaultTextStyle.fill,
  };
}

function confirmContentStyle(wordWrapWidth: number) {
  return {
    ...defaultDialogTextStyle(16),
    align: 'center' as const,
    wordWrapWidth,
    wordWrap: true,
    lineHeight: 24,
  };
}

const loremText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque porttitor aliquam purus, sit amet blandit erat tincidunt nec. Ut consequat, leo vel efficitur fringilla, lacus odio cursus arcu, sed cursus sem leo quis risus. Ut et est non nunc dignissim ullamcorper. Maecenas dictum faucibus quam. Nam orci augue, convallis a neque sit amet, malesuada gravida lacus. Sed malesuada, mi non posuere porta, lorem nisl pharetra orci, eget semper nulla sem non elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Suspendisse eu pretium metus. Maecenas consectetur laoreet odio, sit amet consectetur velit cursus id.';

function dialogButton(
  text: string,
  width: number,
  height: number,
  radius = 20,
  fontSize = 18,
  kind: 'button' | 'fancy' = 'fancy',
  animationOffset: { hoverX?: number; hoverY?: number } = {},
) {
  const hoverX = animationOffset.hoverX ?? -2;
  const hoverY = animationOffset.hoverY ?? -1;
  return {
    kind,
    text,
    width,
    height,
    radius,
    color: pixiStoryColors.color,
    hoverColor: pixiStoryColors.hoverColor,
    pressedColor: pixiStoryColors.pressedColor,
    textStyle: {
      ...pixiDefaultTextStyle,
      fontSize,
      fontWeight: 'bold',
      fill: pixiStoryColors.textColor,
    },
    animations: {
      hover: { props: { scale: { x: 1.03, y: 1.03 }, y: hoverY, x: hoverX }, duration: 100 },
      pressed: { props: { scale: { x: 0.95, y: 0.95 }, x: 2, y: 2 }, duration: 100 },
    },
  };
}

function letterButton(text: string, size = 60, fontSize = 24) {
  return {
    text,
    value: text,
    closeOnPress: true,
    reopenDelay: 2000,
    width: size,
    height: size,
    radius: 8,
    color: pixiStoryColors.color,
    hoverColor: pixiStoryColors.hoverColor,
    pressedColor: pixiStoryColors.pressedColor,
    textStyle: {
      ...pixiDefaultTextStyle,
      fontSize,
      fontWeight: 'bold',
      fill: pixiStoryColors.textColor,
    },
  };
}

function dialogSpriteButton(text: string, width = 313, height = 81, textStyleOverride?: Record<string, unknown>) {
  return {
    text,
    width,
    height,
    defaultView: 'button.png',
    hoverView: 'button_hover.png',
    pressedView: 'button_pressed.png',
    nineSliceSprite: [25, 20, 25, 20] as [number, number, number, number],
    textStyle: {
      ...pixiDefaultTextStyle,
      fontSize: 28,
      fontWeight: 'bold',
      fill: pixiStoryColors.textColor,
      ...(textStyleOverride ?? {}),
    },
    animations: {
      hover: { props: { scale: { x: 1.01, y: 1.01 }, x: -2, y: 0 }, duration: 100 },
      pressed: { props: { scale: { x: 0.99, y: 0.99 }, x: 6, y: 8 }, duration: 100 },
    },
  };
}
