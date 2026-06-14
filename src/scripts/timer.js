export const TIMER_SECONDS = 10;
export const FEEDBACK_DELAY = 1500;
export const OPT_COLORS = ["var(--blue)", "var(--purple)", "var(--orange)", "var(--green)"];
export const OPT_BGS = ["var(--blue-bg)", "var(--purple-bg)", "var(--orange-bg)", "var(--green-bg)"];

export class CountdownTimer {
  constructor(durationSec, onTick, onExpire) {
    this.duration = durationSec;
    this.remaining = durationSec;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.intervalId = null;
    this.running = false;
  }
  start() {
    if (this.running) return;
    this.running = true;
    this.remaining = this.duration;
    this.intervalId = setInterval(() => {
      this.remaining--;
      this.onTick?.(this.remaining, this.duration);
      if (this.remaining <= 0) {
        this.stop();
        this.onExpire?.();
      }
    }, 1000);
  }
  stop() {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
