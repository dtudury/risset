/* eslint-env browser */
/* global sampleRate */

class ShepardToneGenerator extends AudioWorkletProcessor {
  constructor () {
    super()
    this.loopLength = 32
    this.generatorCount = 19
    this.positions = new Array(Math.floor(this.generatorCount))
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
        let sum = 0
        for (let j = 0; j < this.generatorCount; j++) {
          const p = (t / this.loopLength + j / this.generatorCount) % 1
          const position = (440 * 8 * Math.pow(16, p * 2 - 1)) % 1
          const envelope = 0.5 - Math.cos(Math.PI * 2 * p) * 0.5
          sum += Math.sin(position * 2 * Math.PI) * envelope / this.generatorCount
        }
        outputChannel[i] = sum
      }
    }
    this.count += outputChannelLength
    return true
  }
};

registerProcessor('shepard-tone-generator', ShepardToneGenerator)
