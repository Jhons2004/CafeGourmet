// Observer para alertas globales
export class AlertObserver {
  constructor() {
    this.subscribers = [];
  }
  subscribe(fn) {
    this.subscribers.push(fn);
  }
  unsubscribe(fn) {
    this.subscribers = this.subscribers.filter(sub => sub !== fn);
  }
  notify(msg) {
    this.subscribers.forEach(fn => fn(msg));
  }
}
