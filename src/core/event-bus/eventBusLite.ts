type Handler = (payload: any) => void;

class EventBusLite {

  private map = new Map<string, Handler[]>();

  on(event: string, handler: Handler) {
    if (!this.map.has(event)) this.map.set(event, []);
    this.map.get(event)!.push(handler);
  }

  emit(event: string, payload: any) {
    (this.map.get(event) || []).forEach(h => h(payload));
  }

}

export const eventBusLite = new EventBusLite();
