
/* eslint-env browser */
/* global sampleRate */

class RissetRhythmGenerator extends AudioWorkletProcessor {
  constructor () {
    super()
    this.dt = 1 / sampleRate // how long in seconds an output channel frame is (not very long)
    this.generatorCount = 9
    this.positions = new Array(this.generatorCount) // how far along each generator is in it's on-off snare cycle
    this.positions.fill(0) // all snares start sync'd
    this.count = 0
  }

  process (input, outputs, parameters) {
    const output = outputs[0]
    let outputChannelLength = 0
    for (let channel = 0; channel < output.length; ++channel) {
      const outputChannel = output[channel] // on my machine this is 1 (mono) but maybe others have more...
      outputChannelLength = Math.max(outputChannelLength, outputChannel.length)
      for (let i = 0; i < outputChannel.length; ++i) { // we seem to get 128 bytes at a time to process
        const t = (this.count + i) * this.dt // time in seconds since we started the worklet
        outputChannel[i] = 0 // start with silence
        for (let j = 0; j < this.generatorCount; j++) {
          const ji = (((j + t / 12) % this.generatorCount) + this.generatorCount) % this.generatorCount // j is the starting offset but each generator loops around through the full range
          const frequency = 1.5 * Math.pow(2, (ji - this.generatorCount / 2)) // "middle" frequency of snare beats should be 1.5 times per second, others should be offset on logarithmic scale
          this.positions[j] = (this.positions[j] + (this.dt * frequency)) % 1 // move this generator along in it's cycle
          const envelope = 0.5 - Math.cos(Math.PI * 2 * ji / this.generatorCount) * 0.5 // fastest and slowest snares should be silent
          if (this.positions[j] < 0.15) {
            outputChannel[i] += Math.random() * envelope * 5 * (0.15 - this.positions[j]) // make some noise
          }
        }
      }
    }
    this.count += outputChannelLength
    return true
  }
};

registerProcessor('risset-rhythm-generator', RissetRhythmGenerator)
