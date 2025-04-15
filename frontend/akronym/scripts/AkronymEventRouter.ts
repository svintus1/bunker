type EventHandler = (e: Event) => void;

type EventEntry = {
  element: EventTarget;
  eventName: string;
  handler: EventHandler;           // Оригинальный хендлер
  wrappedHandler: EventHandler;    // Обёрнутый, фактически навешиваемый
  once: boolean;
};

export class AkronymEventRouter {
  private static entries: EventEntry[] = [];

  /**
   * Добавляет обработчик события. Если once = true, он удаляется после первого срабатывания.
   */
  static add(element: EventTarget, eventName: string, handler: EventHandler, once = false): void {
    let wrappedHandler: EventHandler;

    if (once) {
      wrappedHandler = (e: Event) => {
        handler(e);
        this.remove(element, eventName, handler); // Удаляем после первого вызова
      };
    } else {
      wrappedHandler = handler;
    }

    this.entries.push({ element, eventName, handler, wrappedHandler, once });
    element.addEventListener(eventName, wrappedHandler);
  }

  /**
   * Удаляет ранее добавленный обработчик.
   */
  static remove(element: EventTarget, eventName: string, handler: EventHandler): void {
    const index = this.entries.findIndex(entry =>
      entry.element === element &&
      entry.eventName === eventName &&
      entry.handler === handler
    );

    if (index !== -1) {
      const entry = this.entries[index];
      entry.element.removeEventListener(entry.eventName, entry.wrappedHandler);
      this.entries.splice(index, 1);
    }
  }

  /**
   * Очищает все зарегистрированные обработчики.
   */
  static clear(): void {
    for (const entry of this.entries) {
      entry.element.removeEventListener(entry.eventName, entry.wrappedHandler);
    }
    this.entries = [];
  }

  static printEntries(): void {
    console.log('Registered Event Entries:');
    this.entries.forEach((entry, index) => {
      console.log(`#${index + 1}:`, {
        element: entry.element,
        eventName: entry.eventName,
        handler: entry.handler,
        once: entry.once
      });
    });
  }
  
}
