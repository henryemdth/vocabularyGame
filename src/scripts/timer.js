export const OPT_COLORS = ["var(--blue)", "var(--purple)", "var(--orange)", "var(--green)"];
export const OPT_BGS = ["var(--blue-bg)", "var(--purple-bg)", "var(--orange-bg)", "var(--green-bg)"];

export class CountdownTimer {
  constructor(durationSec, onTick, onExpire) {
    this.duration = durationSec;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.intervalId = null;
    this.running = false;
  }
  start() {
    if (this.running) return;
    this.running = true;
    this.startTime = Date.now();
    this.intervalId = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      const remaining = Math.max(0, this.duration - elapsed);
      this.onTick?.(remaining, this.duration);
      if (remaining <= 0) {
        this.stop();
        this.onExpire?.();
      }
    }, 50);
  }
  stop() {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
