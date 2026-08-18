export class BoundedMqttRecovery {
  constructor({ maxAttempts = 2 } = {}) {
    this.maxAttempts = maxAttempts;
    this.attempts = 0;
  }

  request() {
    if (this.attempts >= this.maxAttempts) {
      return { action: "escalate", attempt: this.attempts };
    }
    this.attempts += 1;
    return { action: "retry", attempt: this.attempts };
  }

  reset() {
    this.attempts = 0;
  }
}
