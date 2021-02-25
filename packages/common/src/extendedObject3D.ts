/**
 * @author       Yannick Deubel (https://github.com/yandeu)
 * @copyright    Copyright (c) 2021 Yannick Deubel; Project Url: https://github.com/enable3d/enable3d
 * @license      {@link https://github.com/enable3d/enable3d/blob/master/LICENSE|GNU GPLv3}
 */

import { AnimationClip, AnimationMixer, Mesh, Line, Points, Object3D, Vector3, LoopOnce } from 'three'
import type PhysicsBody from './physicsBody'
import { AnimationAction } from 'three'

export interface ExtendedObject3D extends Line, Mesh, Points {
  isLine: any
  isPoints: any
  isMesh: any
  type: any
}

export class ExtendedObject3D extends Object3D {
  private vector3 = new Vector3()
  public readonly isGroup = false

  public shape: string
  public name: string
  public body: PhysicsBody
  public hasBody: boolean = false

  // convex object breaking
  public fragmentDepth = 0
  public breakable = false
  public fractureImpulse = 1

  private _currentAnimation: string = ''
  private _animationActions: Map<string, AnimationAction> = new Map()
  private _animationMixer: AnimationMixer

  constructor() {
    super()
    this.name = `object-${this.id}`
  }

  /** Returns all values relative to the world. */
  get world() {
    return {
      theta: this.worldTheta,
      phi: this.worldPhi
    }
  }

  /** Get the theta relative to the world. */
  private get worldTheta() {
    this.getWorldDirection(this.vector3)
    return Math.atan2(this.vector3.x, this.vector3.z)
  }

  /** Get the phi relative to the world. */
  private get worldPhi() {
    this.getWorldDirection(this.vector3)
    return Math.acos(this.vector3.y)
  }

  public set animationMixer(animationMixer: AnimationMixer) {
    this._animationMixer = animationMixer
  }

  public get animationMixer() {
    if (!this._animationMixer) this._animationMixer = new AnimationMixer(this)
    return this._animationMixer
  }

  public get animation() {
    return {
      /** Get the name of the current animation. */
      current: this._currentAnimation,
      /** Add animation name and the AnimationClip. */
      add: (name: string, animation: AnimationClip) => this.animationAdd(name, animation),
      /** Get AnimationAction by animation name. */
      get: (name: string) => this.animationGet(name),
      /**
       * Play an animation.
       * @param name Animation name.
       * @param transitionDuration Transition duration in ms.
       * @param loop Should the animation loop?
       */
      play: (name: string, transitionDuration = 500, loop: boolean = true) =>
        this.animationPlay(name, transitionDuration, loop),
      /** Get the AnimationMixer */
      mixer: this.animationMixer
    }
  }

  private animationAdd(name: string, animation: AnimationClip) {
    this._animationActions.set(name, this.animationMixer.clipAction(animation))
  }

  private animationGet(name: string) {
    const action = this._animationActions.get(name) as AnimationAction
    if (!action) console.warn(`[enable3d] Animation(${name}) not found!`)
    return action
  }

  private animationPlay(name: string, transitionDuration = 500, loop: boolean = true) {
    const next = this._animationActions.get(name)
    const current = this._animationActions.get(this._currentAnimation)

    if (next) {
      next.reset()

      if (current) {
        next.crossFadeFrom(current, transitionDuration / 1000, true)
        next.clampWhenFinished = true
      }

      if (!loop) next.setLoop(LoopOnce, 0)
      next.play()
    }

    this._currentAnimation = name
  }

  /** @deprecated Use animation.play(name) instead! */
  public setAction(name: string) {
    console.warn(`[enable3d] setAction(${name}) is deprecated. Use animation.play(${name}) instead!`)
  }
}

export default ExtendedObject3D
