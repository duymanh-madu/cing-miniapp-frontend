class SocketGateway {

  private listeners = new Map<string, Function[]>();

  subscribe(event: string, handler: Function) {

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event)!.push(handler);
  }

  emit(event: string, data: any) {

    const handlers = this.listeners.get(event);

    if (!handlers) return;

    for (const h of handlers) {
      h(data);
    }

  }

  clear(event?: string) {
    if (event) this.listeners.delete(event);
    else this.listeners.clear();
  }

}

export const socketGateway = new SocketGateway();
