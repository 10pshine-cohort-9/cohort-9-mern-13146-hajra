async function withFallback(obj, primaryName, fallbackName, fallbackImpl, testFn) {
    const originalPrimary = obj[primaryName];
    const hadFallback = Object.prototype.hasOwnProperty.call(obj, fallbackName);
    const originalFallback = obj[fallbackName];

    delete obj[primaryName];
    obj[fallbackName] = fallbackImpl;

    try {
        await testFn();
    } finally {
        obj[primaryName] = originalPrimary;
        if (hadFallback) {
            obj[fallbackName] = originalFallback;
        } else {
            delete obj[fallbackName];
        }
    }
}

module.exports = withFallback;