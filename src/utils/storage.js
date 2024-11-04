
export function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalStorage(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

export function removeLocalStorage(key) {
    localStorage.removeItem(key);
}

export function removeAllLocalStorage() {
    localStorage.clear();
}