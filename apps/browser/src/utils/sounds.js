let ctx = null
let enabled = true

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function synth({ freq, freqEnd, dur, vol = 0.12, type = 'sine', delay = 0 }) {
  try {
    const c = ac()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = type
    const t = c.currentTime + delay
    osc.frequency.setValueAtTime(freq, t)
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur * 0.75)
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.start(t)
    osc.stop(t + dur + 0.01)
  } catch {}
}

export function setSoundsEnabled(v) { enabled = v }
export function isSoundsEnabled() { return enabled }

export const sounds = {
  tabOpen() {
    if (!enabled) return
    synth({ freq: 480, freqEnd: 720, dur: 0.1, vol: 0.1 })
    synth({ freq: 720, freqEnd: 960, dur: 0.09, vol: 0.06, delay: 0.06 })
  },
  tabClose() {
    if (!enabled) return
    synth({ freq: 560, freqEnd: 280, dur: 0.1, vol: 0.09 })
  },
  navigate() {
    if (!enabled) return
    synth({ freq: 680, freqEnd: 520, dur: 0.07, vol: 0.05, type: 'triangle' })
  },
  pageLoad() {
    if (!enabled) return
    synth({ freq: 523, dur: 0.08, vol: 0.07 })
    synth({ freq: 659, dur: 0.08, vol: 0.065, delay: 0.08 })
    synth({ freq: 784, dur: 0.13, vol: 0.08, delay: 0.16 })
  },
  workspaceSwitch() {
    if (!enabled) return
    synth({ freq: 400, freqEnd: 600, dur: 0.12, vol: 0.08, type: 'triangle' })
  },
  screenshot() {
    if (!enabled) return
    synth({ freq: 1200, freqEnd: 800, dur: 0.08, vol: 0.1 })
    synth({ freq: 900, dur: 0.15, vol: 0.06, delay: 0.06 })
  },
}
