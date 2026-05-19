// Web Worker for accurate time tracking even when tab is in background
let startTime = null;
let intervalId = null;

self.onmessage = function (e) {
    const { type, startedAt } = e.data;

    if (type === 'start') {
        startTime = new Date(startedAt).getTime();
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            self.postMessage({ type: 'tick', elapsed });
        }, 1000);
    }

    if (type === 'stop') {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
        startTime = null;
        self.postMessage({ type: 'stopped' });
    }
};
