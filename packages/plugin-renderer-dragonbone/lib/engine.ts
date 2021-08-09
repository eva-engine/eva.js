import dragonBones from './db';

export default class DragonBone {
  armature;
  factory = dragonBones.PixiFactory.factory;
  constructor({ armatureName }) {
    this.armature = this.factory.buildArmatureDisplay(armatureName);
  }
  play(name, time) {
    return this.armature.animation.play(name, time);
  }
  stop(name) {
    return this.armature.animation.stop(name);
  }
}
