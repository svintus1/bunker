export class AkronymEventRouter {
    /**
     * Добавляет обработчик события. Если once = true, он удаляется после первого срабатывания.
     */
    static add(element, eventName, handler, once = false) {
        let wrappedHandler;
        if (once) {
            wrappedHandler = (e) => {
                handler(e);
                this.remove(element, eventName, handler); // Удаляем после первого вызова
            };
        }
        else {
            wrappedHandler = handler;
        }
        this.entries.push({ element, eventName, handler, wrappedHandler, once });
        element.addEventListener(eventName, wrappedHandler);
    }
    /**
     * Удаляет ранее добавленный обработчик.
     */
    static remove(element, eventName, handler) {
        const index = this.entries.findIndex(entry => entry.element === element &&
            entry.eventName === eventName &&
            entry.handler === handler);
        if (index !== -1) {
            const entry = this.entries[index];
            entry.element.removeEventListener(entry.eventName, entry.wrappedHandler);
            this.entries.splice(index, 1);
        }
    }
    /**
     * Очищает все зарегистрированные обработчики.
     */
    static clear() {
        for (const entry of this.entries) {
            entry.element.removeEventListener(entry.eventName, entry.wrappedHandler);
        }
        this.entries = [];
    }
    static printEntries() {
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
AkronymEventRouter.entries = [];
