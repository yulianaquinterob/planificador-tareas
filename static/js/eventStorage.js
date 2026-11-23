const eventStorage = {
    load() {
        const storedEvents = localStorage.getItem('events');
        return storedEvents ? JSON.parse(storedEvents) : [];
    },

    save(events) {
        localStorage.setItem('events', JSON.stringify(events));
    }
};
