/* eslint-env browser */
/* global sampleRate */

class ShepardToneGenerator extends AudioWorkletProcessor {
  constructor () {
    super()
    this.dt = 1 / sampleRate
    this.generatorCount = 20
    this.positions = new Array(this.generatorCount)
    for (let i = 0; i < this.generatorCount; ++i) {
      this.positions[i] = Math.random()
    }
    this.count = 0
  }

  process (input, outputs, parameters) {
    const output = outputs[0]
    let outputChannelLength = 0
    for (let channel = 0; channel < output.length; ++channel) {
      const outputChannel = output[channel]
      outputChannelLength = Math.max(outputChannelLength, outputChannel.length)
      for (let i = 0; i < outputChannel.length; ++i) {
        const t = (this.count + i) / sampleRate
        outputChannel[i] = 0
        for (let j = 0; j < this.generatorCount; j++) {
          const ji = (((j + t / 2.7) % this.generatorCount) + this.generatorCount) % this.generatorCount
          const frequency = 220 * Math.pow(2, (ji - this.generatorCount / 2) / 2.7)
          this.positions[j] = (this.positions[j] + (this.dt * frequency)) % 1
          const envelope = 0.5 - Math.cos(Math.PI * 2 * ji / this.generatorCount) * 0.5
          outputChannel[i] += Math.sin(this.positions[j] * 2 * Math.PI) * envelope * 0.1
        }
      }
    }
    this.count += outputChannelLength
    return true
  }
};

registerProcessor('shepard-tone-generator', ShepardToneGenerator)
