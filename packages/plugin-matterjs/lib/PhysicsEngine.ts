import Matter from './matter';
import BodiesFactory from './BodiesFactory';
import { Component, Game } from '@eva/eva.js';
import type { Physics } from './Physics';
export default class PhysicsEngine {
  private Engine: any;
  private World: any;
  private engine: any;
  private bodiesFatoty: BodiesFactory;
  private Render: any;
  private collisionEvents: string[];
  private bodyEvents: string[];
  private options: any;
  private game: Game;
  private Runner: any;
  private Constraint: any;
  private mouseConstraint: any;
  private runner: any;
  public enabled: boolean = false;
  constructor(game: Game, options: any) {
    this.Engine = Matter.Engine;
    this.World = Matter.World;
    this.bodiesFatoty = new BodiesFactory();
    this.Render = Matter.Render;
    this.Runner = Matter.Runner;
    this.Constraint = Matter.Constraint;
    this.game = game;

    this.collisionEvents = ['collisionStart', 'collisionActive', 'collisionEnd'];
    this.bodyEvents = ['tick', 'beforeUpdate', 'afterUpdate', 'beforeRender', 'afterRender', 'afterTick'];
    this.options = options;
    this.runner = this.Runner.create({
      fps: this.options.fps || 60,
    });
  }

  public start() {
    this.engine = this.Engine.create();
    const world = this.World.create(this.options.world);
    this.engine.world = world;
    if (this.options.isTest) {
      const render = this.Render.create({
        element: this.options.element,
        engine: this.engine,
        canvas: this.options.canvas ?? document.createElement('canvas'),
        options: {
          width: this.game.canvas.width / this.options.resolution,
          height: this.game.canvas.height / this.options.resolution,
          pixelRatio: this.options.resolution,
          showAngleIndicator: true,
        },
      });
      this.Render.run(render);
      this.Runner.run(this.runner, this.engine);
    }
    this.enabled = true;
    this.initMouse();
    this.initCollisionEvents();
    this.initBodyEvents();
  }
  public update() {
    if (!this.options.isTest) {
      this.Runner.tick(this.runner, this.engine);
    }
  }

  public stop() {
    this.enabled = false;
    this.runner.enabled = false;
  }

  public awake() {
    this.enabled = true;
    this.runner.enabled = true;
  }
  public add(component) {
    const body = this.createBodies(component);
    this.World.add(this.engine.world, [body]);
    component.body = body;
    component.Body = Matter.Body;
    component.PhysicsEngine = this.engine;
    component.Constraint = this.Constraint;
    component.mouseConstraint = this.mouseConstraint;
    component.World = this.World;
    body.component = component;
  }

  public change(component: Physics) {
    const newBody = this.createBodies(component);
    this.World.remove(this.engine.world, component.body, true);
    this.World.add(this.engine.world, [newBody]);
    component.body = newBody;
  }
  public remove(component: Physics) {
    this.World.remove(this.engine.world, component.body, true);
    component.body = undefined;
  }

  private createBodies(params): any {
    const body = this.bodiesFatoty.create(params);
    return body;
  }

  private initCollisionEvents() {
    this.collisionEvents.forEach(eventName => {
      Matter.Events.on(this.engine, eventName, event => {
        const pairs: any[] = event.pairs || [];
        for (let i = 0; i < pairs.length; i++) {
          const pair = pairs[i];
          const { bodyA, bodyB } = pair;
          const componentA: Component = bodyA.component;
          const componentB: Component = bodyB.component;
          componentA.emit(eventName, componentB.gameObject, componentA.gameObject);
          componentB.emit(eventName, componentA.gameObject, componentB.gameObject);
        }
      });
    });
  }

  private initMouse() {
    if (this.options.mouse && this.options.mouse.open) {
      const mouse = Matter.Mouse.create(this.game.canvas);
      let options = this.options.mouse.constraint ? {
        mouse,
        constraint: this.options.mouse.constraint
      } : {
          mouse
        };
      this.mouseConstraint = Matter.MouseConstraint.create(this.engine, options);
      this.World.add(this.engine.world, this.mouseConstraint);
    }
  }

  private initBodyEvents() {
    this.bodyEvents.forEach(eventName => {
      Matter.Events.on(this.engine, eventName, e => {
        const bodies = e.source.world.bodies;
        bodies.forEach(body => {
          body.component.emit(eventName, body, body.component.gameObject);
        });
      });
    });
  }
}
