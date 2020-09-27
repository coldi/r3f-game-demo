export interface PubSubEvent<EventName = string, Data = any> {
    name: EventName;
    data: Data;
}

export type PubSubHandler<T = any> = (data: T) => void | Promise<any>;

export default function createPubSub() {
    const events: { [name: string]: PubSubHandler[] } = {};

    async function publish<T extends PubSubEvent>(name: T['name'], data?: T['data']) {
        const handlers = events[name];
        if (handlers == null) return false;

        // make snapshot of handlers, to prevent inbetween unsubscribe calls
        // from mutating this array.
        await Promise.all(handlers.slice().map(handler => handler(data)));
        return true;
    }

    function unsubscribe<T extends PubSubEvent>(
        name: T['name'],
        handler: PubSubHandler<T['data']>
    ) {
        const handlers = events[name];
        if (handlers == null) return;

        const index = handlers.indexOf(handler);
        handlers.splice(index, 1);
    }

    function subscribe<T extends PubSubEvent>(
        name: T['name'],
        handler: PubSubHandler<T['data']>
    ) {
        if (events[name] == null) {
            events[name] = [];
        }
        events[name].push(handler);

        return () => unsubscribe(name, handler);
    }

    function hasSubscriptions<T extends PubSubEvent>(name: T['name']) {
        if (events[name] == null) {
            return 0;
        }
        return events[name].length;
    }

    return {
        publish,
        subscribe,
        // unsubscribe,
        hasSubscriptions,
    };
}

export type PubSub = ReturnType<typeof createPubSub>;
