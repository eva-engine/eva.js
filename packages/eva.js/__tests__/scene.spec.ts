import {Scene, Transform, GameObject} from '../lib';

describe('Scene', () => {
  it('create scene', () => {
    const scene = new Scene('scene');
    expect(scene.scene).toStrictEqual(scene);
    expect(scene.transform).toBeInstanceOf(Transform);
  });

  it('add game object', () => {
    const scene = new Scene('scene');
    // scene.gameObjects contain itself, the length of init gameObjects is 1;
    expect(scene.gameObjects.length).toBe(1);
    const gameObj = new GameObject('gameobj');
    scene.addGameObject(gameObj);
    expect(scene.gameObjects.length).toBe(2);
    expect(gameObj.transform.inScene).toBe(true);
  });

  it('remove game object', () => {
    const scene = new Scene('scene');

    const gameObj = new GameObject('gameObj');
    scene.removeGameObject(gameObj);
    expect(scene.gameObjects.length).toBe(1);

    scene.removeGameObject(scene);

    expect(scene.gameObjects.length).toBe(0);
    expect(scene.transform.inScene).toBeFalsy();
  });

  it('destory', () => {
    const scene = new Scene('scene');
    const gameObj = new GameObject('gameobj');
    scene.addChild(gameObj);
    const gameObjectTransfrom = gameObj.transform;
    scene.destroy();
    expect(scene.transform).toBeUndefined();
    expect(gameObjectTransfrom.inScene).toBeFalsy();
  });
});
