export interface PixiUiStoryManifestEntry {
  key: string;
  storybookId: string;
  sourceFile: string;
  exportName: string;
  exampleFile: string;
}

export const PIXI_UI_STORY_MANIFEST = [
  {
    key: 'button-use-graphics',
    storybookId: 'components-button-use-graphics--use-graphics',
    sourceFile: 'button/ButtonGraphics.stories.ts',
    exportName: 'UseGraphics',
    exampleFile: 'plugin-ui-pixi-button-use-graphics.ts',
  },
  {
    key: 'button-use-sprite',
    storybookId: 'components-button-use-sprite--use-sprite',
    sourceFile: 'button/ButtonSprite.stories.ts',
    exportName: 'UseSprite',
    exampleFile: 'plugin-ui-pixi-button-use-sprite.ts',
  },
  {
    key: 'checkbox-use-graphics',
    storybookId: 'components-checkbox-use-graphics--use-graphics',
    sourceFile: 'checkbox/CheckBoxGraphics.stories.ts',
    exportName: 'UseGraphics',
    exampleFile: 'plugin-ui-pixi-checkbox-use-graphics.ts',
  },
  {
    key: 'checkbox-use-sprite',
    storybookId: 'components-checkbox-use-sprite--use-sprite',
    sourceFile: 'checkbox/CheckBoxSprite.stories.ts',
    exportName: 'UseSprite',
    exampleFile: 'plugin-ui-pixi-checkbox-use-sprite.ts',
  },
  {
    key: 'dialog-graphics-simple-alert',
    storybookId: 'components-dialog-use-graphics--simple-alert',
    sourceFile: 'dialog/DialogGraphics.stories.ts',
    exportName: 'SimpleAlert',
    exampleFile: 'plugin-ui-pixi-dialog-graphics-simple-alert.ts',
  },
  {
    key: 'dialog-graphics-confirm-dialog',
    storybookId: 'components-dialog-use-graphics--confirm-dialog',
    sourceFile: 'dialog/DialogGraphics.stories.ts',
    exportName: 'ConfirmDialog',
    exampleFile: 'plugin-ui-pixi-dialog-graphics-confirm-dialog.ts',
  },
  {
    key: 'dialog-graphics-three-buttons',
    storybookId: 'components-dialog-use-graphics--three-buttons',
    sourceFile: 'dialog/DialogGraphics.stories.ts',
    exportName: 'ThreeButtons',
    exampleFile: 'plugin-ui-pixi-dialog-graphics-three-buttons.ts',
  },
  {
    key: 'dialog-nine-slice-background',
    storybookId: 'components-dialog-use-nineslicesprite--nine-slice-background',
    sourceFile: 'dialog/DialogNineSlice.stories.ts',
    exportName: 'NineSliceBackground',
    exampleFile: 'plugin-ui-pixi-dialog-nine-slice-background.ts',
  },
  {
    key: 'dialog-nine-slice-confirm',
    storybookId: 'components-dialog-use-nineslicesprite--nine-slice-confirm',
    sourceFile: 'dialog/DialogNineSlice.stories.ts',
    exportName: 'NineSliceConfirm',
    exampleFile: 'plugin-ui-pixi-dialog-nine-slice-confirm.ts',
  },
  {
    key: 'dialog-sprite-letter-grid-selector',
    storybookId: 'components-dialog-use-sprite--letter-grid-selector',
    sourceFile: 'dialog/DialogSprite.stories.ts',
    exportName: 'LetterGridSelector',
    exampleFile: 'plugin-ui-pixi-dialog-sprite-letter-grid-selector.ts',
  },
  {
    key: 'dialog-sprite-checkbox-swap-dialog',
    storybookId: 'components-dialog-use-sprite--checkbox-swap-dialog',
    sourceFile: 'dialog/DialogSprite.stories.ts',
    exportName: 'CheckboxSwapDialog',
    exampleFile: 'plugin-ui-pixi-dialog-sprite-checkbox-swap-dialog.ts',
  },
  {
    key: 'fancy-button-using-sprite-and-bitmap-text',
    storybookId: 'components-fancybutton-using-sprite-and-bitmaptext--using-sprite-and-bitmap-text',
    sourceFile: 'fancyButton/FancyButtonBitmapText.stories.ts',
    exportName: 'UsingSpriteAndBitmapText',
    exampleFile: 'plugin-ui-pixi-fancy-button-using-sprite-and-bitmap-text.ts',
  },
  {
    key: 'fancy-button-dynamic-update',
    storybookId: 'components-fancybutton-dynamic-update--dynamic-update',
    sourceFile: 'fancyButton/FancyButtonDynamicUpdate.stories.ts',
    exportName: 'DynamicUpdate',
    exampleFile: 'plugin-ui-pixi-fancy-button-dynamic-update.ts',
  },
  {
    key: 'fancy-button-use-graphics',
    storybookId: 'components-fancybutton-use-graphics--use-graphics',
    sourceFile: 'fancyButton/FancyButtonGraphics.stories.ts',
    exportName: 'UseGraphics',
    exampleFile: 'plugin-ui-pixi-fancy-button-use-graphics.ts',
  },
  {
    key: 'fancy-button-using-sprite-and-html-text',
    storybookId: 'components-fancybutton-using-sprite-and-htmltext--using-sprite-and-html-text',
    sourceFile: 'fancyButton/FancyButtonHTMLText.stories.ts',
    exportName: 'UsingSpriteAndHTMLText',
    exampleFile: 'plugin-ui-pixi-fancy-button-using-sprite-and-html-text.ts',
  },
  {
    key: 'fancy-button-use-icon',
    storybookId: 'components-fancybutton-use-icon--use-icon',
    sourceFile: 'fancyButton/FancyButtonIcon.stories.ts',
    exportName: 'UseIcon',
    exampleFile: 'plugin-ui-pixi-fancy-button-use-icon.ts',
  },
  {
    key: 'fancy-button-use-nine-slice-sprite',
    storybookId: 'components-fancybutton-use-nineslicesprite--use-nine-slice-sprite',
    sourceFile: 'fancyButton/FancyButtonNineSliceSprite.stories.ts',
    exportName: 'UseNineSliceSprite',
    exampleFile: 'plugin-ui-pixi-fancy-button-use-nine-slice-sprite.ts',
  },
  {
    key: 'fancy-button-use-sprite',
    storybookId: 'components-fancybutton-use-sprite--use-sprite',
    sourceFile: 'fancyButton/FancyButtonSprite.stories.ts',
    exportName: 'UseSprite',
    exampleFile: 'plugin-ui-pixi-fancy-button-use-sprite.ts',
  },
  {
    key: 'fancy-button-text-link',
    storybookId: 'components-fancybutton-text-link--text-link',
    sourceFile: 'fancyButton/FancyButtonTextLink.stories.ts',
    exportName: 'TextLink',
    exampleFile: 'plugin-ui-pixi-fancy-button-text-link.ts',
  },
  {
    key: 'input-use-graphics',
    storybookId: 'components-input-use-graphics--use-graphics',
    sourceFile: 'input/InputGraphics.stories.ts',
    exportName: 'UseGraphics',
    exampleFile: 'plugin-ui-pixi-input-use-graphics.ts',
  },
  {
    key: 'input-use-nine-slice-sprite',
    storybookId: 'components-input-use-nineslicesprite--use-nine-slice-sprite',
    sourceFile: 'input/InputNineSliceSprite.stories.ts',
    exportName: 'UseNineSliceSprite',
    exampleFile: 'plugin-ui-pixi-input-use-nine-slice-sprite.ts',
  },
  {
    key: 'input-use-sprite',
    storybookId: 'components-input-use-sprite--use-sprite',
    sourceFile: 'input/InputSprite.stories.ts',
    exportName: 'UseSprite',
    exampleFile: 'plugin-ui-pixi-input-use-sprite.ts',
  },
  {
    key: 'list-use-graphics',
    storybookId: 'components-list-use-graphics--use-graphics',
    sourceFile: 'list/ListGraphics.stories.ts',
    exportName: 'UseGraphics',
    exampleFile: 'plugin-ui-pixi-list-use-graphics.ts',
  },
  {
    key: 'list-use-sprite',
    storybookId: 'components-list-use-sprite--use-sprite',
    sourceFile: 'list/ListSprite.stories.ts',
    exportName: 'UseSprite',
    exampleFile: 'plugin-ui-pixi-list-use-sprite.ts',
  },
  {
    key: 'masked-frame-use-graphics',
    storybookId: 'components-maskedframe-use-graphics--use-graphics',
    sourceFile: 'maskedFrame/MaskedFrameGraphics.stories.ts',
    exportName: 'UseGraphics',
    exampleFile: 'plugin-ui-pixi-masked-frame-use-graphics.ts',
  },
  {
    key: 'masked-frame-use-sprite',
    storybookId: 'components-maskedframe-use-sprite--use-sprite',
    sourceFile: 'maskedFrame/MaskedFrameSprite.stories.ts',
    exportName: 'UseSprite',
    exampleFile: 'plugin-ui-pixi-masked-frame-use-sprite.ts',
  },
  {
    key: 'progress-bar-circular',
    storybookId: 'components-progressbar-circular--circular',
    sourceFile: 'progressBar/ProgressBarCircular.stories.ts',
    exportName: 'circular',
    exampleFile: 'plugin-ui-pixi-progress-bar-circular.ts',
  },
  {
    key: 'progress-bar-use-graphics',
    storybookId: 'components-progressbar-usegraphics--use-graphics',
    sourceFile: 'progressBar/ProgressBarGraphics.stories.ts',
    exportName: 'UseGraphics',
    exampleFile: 'plugin-ui-pixi-progress-bar-use-graphics.ts',
  },
  {
    key: 'progress-bar-nine-slice-sprite',
    storybookId: 'components-progressbar-nineslicesprite--nine-slice-sprite',
    sourceFile: 'progressBar/ProgressBarNineSliceSprite.stories.ts',
    exportName: 'NineSliceSprite',
    exampleFile: 'plugin-ui-pixi-progress-bar-nine-slice-sprite.ts',
  },
  {
    key: 'progress-bar-sprite',
    storybookId: 'components-progressbar-sprite--sprite',
    sourceFile: 'progressBar/ProgressBarSprite.stories.ts',
    exportName: 'Sprite',
    exampleFile: 'plugin-ui-pixi-progress-bar-sprite.ts',
  },
  {
    key: 'radio-group-use-graphics',
    storybookId: 'components-radiogroup-use-graphics--use-graphics',
    sourceFile: 'radio/RadioGraphics.stories.ts',
    exportName: 'UseGraphics',
    exampleFile: 'plugin-ui-pixi-radio-group-use-graphics.ts',
  },
  {
    key: 'radio-group-use-sprite',
    storybookId: 'components-radiogroup-use-sprite--use-sprite',
    sourceFile: 'radio/RadioSprite.stories.ts',
    exportName: 'UseSprite',
    exampleFile: 'plugin-ui-pixi-radio-group-use-sprite.ts',
  },
  {
    key: 'scroll-box-use-dynamic-dimensions',
    storybookId: 'components-scrollbox-use-dynamic-dimensions--use-dynamic-dimensions',
    sourceFile: 'scrollBox/ScrollBoxDynamicDimensions.stories.ts',
    exportName: 'UseDynamicDimensions',
    exampleFile: 'plugin-ui-pixi-scroll-box-use-dynamic-dimensions.ts',
  },
  {
    key: 'scroll-box-use-graphics',
    storybookId: 'components-scrollbox-use-graphics--use-graphics',
    sourceFile: 'scrollBox/ScrollBoxGraphics.stories.ts',
    exportName: 'UseGraphics',
    exampleFile: 'plugin-ui-pixi-scroll-box-use-graphics.ts',
  },
  {
    key: 'scroll-box-proximity-event',
    storybookId: 'components-scrollbox-proximity-event--proximity-event',
    sourceFile: 'scrollBox/ScrollBoxProximity.stories.ts',
    exportName: 'ProximityEvent',
    exampleFile: 'plugin-ui-pixi-scroll-box-proximity-event.ts',
  },
  {
    key: 'scroll-box-use-sprite',
    storybookId: 'components-scrollbox-use-sprite--use-sprite',
    sourceFile: 'scrollBox/ScrollBoxSprite.stories.ts',
    exportName: 'UseSprite',
    exampleFile: 'plugin-ui-pixi-scroll-box-use-sprite.ts',
  },
  {
    key: 'select-use-graphics',
    storybookId: 'components-select-use-graphics--use-graphics',
    sourceFile: 'select/SelectGraphics.stories.ts',
    exportName: 'UseGraphics',
    exampleFile: 'plugin-ui-pixi-select-use-graphics.ts',
  },
  {
    key: 'select-use-html-text',
    storybookId: 'components-select-use-html-text--use-html-text',
    sourceFile: 'select/SelectHTMLText.stories.ts',
    exportName: 'UseHTMLText',
    exampleFile: 'plugin-ui-pixi-select-use-html-text.ts',
  },
  {
    key: 'select-use-sprite',
    storybookId: 'components-select-use-sprite--use-sprite',
    sourceFile: 'select/SelectSprite.stories.ts',
    exportName: 'UseSprite',
    exampleFile: 'plugin-ui-pixi-select-use-sprite.ts',
  },
  {
    key: 'slider-double-graphics',
    storybookId: 'components-slider-graphics--double',
    sourceFile: 'slider/DoubleSliderGraphics.stories.ts',
    exportName: 'Double',
    exampleFile: 'plugin-ui-pixi-slider-double-graphics.ts',
  },
  {
    key: 'slider-double-nine-slice-sprite',
    storybookId: 'components-slider-spritenineslicesprite--double',
    sourceFile: 'slider/DoubleSliderNineSliceSprite.stories.ts',
    exportName: 'Double',
    exampleFile: 'plugin-ui-pixi-slider-double-nine-slice-sprite.ts',
  },
  {
    key: 'slider-double-sprite',
    storybookId: 'components-slider-sprite--double',
    sourceFile: 'slider/DoubleSliderSprite.stories.ts',
    exportName: 'Double',
    exampleFile: 'plugin-ui-pixi-slider-double-sprite.ts',
  },
  {
    key: 'slider-single-graphics',
    storybookId: 'components-slider-graphics--single',
    sourceFile: 'slider/SliderGraphics.stories.ts',
    exportName: 'Single',
    exampleFile: 'plugin-ui-pixi-slider-single-graphics.ts',
  },
  {
    key: 'slider-single-nine-slice-sprite',
    storybookId: 'components-slider-spritenineslicesprite--single',
    sourceFile: 'slider/SliderNineSliceSprite.stories.ts',
    exportName: 'Single',
    exampleFile: 'plugin-ui-pixi-slider-single-nine-slice-sprite.ts',
  },
  {
    key: 'slider-single-sprite',
    storybookId: 'components-slider-sprite--single',
    sourceFile: 'slider/SliderSprite.stories.ts',
    exportName: 'Single',
    exampleFile: 'plugin-ui-pixi-slider-single-sprite.ts',
  },
  {
    key: 'switcher-sprites',
    storybookId: 'components-switcher-sprites--sprites',
    sourceFile: 'switcher/Switcher.stories.ts',
    exportName: 'Sprites',
    exampleFile: 'plugin-ui-pixi-switcher-sprites.ts',
  },
] as const satisfies readonly PixiUiStoryManifestEntry[];

export type PixiUiStoryKey = typeof PIXI_UI_STORY_MANIFEST[number]['key'];
export type PixiUiButtonStoryKey = Extract<PixiUiStoryKey, 'button-use-graphics' | 'button-use-sprite'>;
export type PixiUiNonButtonStoryKey = Exclude<PixiUiStoryKey, PixiUiButtonStoryKey>;

export const PIXI_UI_STORY_KEYS = PIXI_UI_STORY_MANIFEST.map((entry) => entry.key) as PixiUiStoryKey[];

export function getPixiUiStoryManifestEntry(key: PixiUiStoryKey): PixiUiStoryManifestEntry {
  const entry = PIXI_UI_STORY_MANIFEST.find((item) => item.key === key);
  if (!entry) {
    throw new Error(`Unknown @pixi/ui story key: ${key}`);
  }
  return entry;
}
