/* eslint-env browser */
/* global sampleRate */

class RissetRhythmGenerator extends AudioWorkletProcessor {
  constructor () {
    super()
    this.loopLength = 32
    this.generatorCount = 2
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
          const position = (8 * Math.pow(2, 8 * (p - 0.5))) % 1
          const pressure = position < 0.1 ? (0.1 - position) / 0.1 * Math.random() : 0
          const envelope = 0.5 - Math.cos(Math.PI * 2 * p) * 0.5
          sum += pressure * envelope
        }
        outputChannel[i] = sum % 1
      }
    }
    this.count += outputChannelLength
    return true
  }
};

registerProcessor('risset-rhythm-generator', RissetRhythmGenerator)
