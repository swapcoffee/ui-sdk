let interval = null
let debounce = null
let timeout = null

export function removeRefreshDebounce() {
    if (debounce) {
        clearTimeout(debounce)
    }
}

export function removeRefreshInterval() {
    if (interval) {
        clearInterval(interval)
    }
    if (timeout) {
        clearTimeout(timeout)
    }
}

export function refreshAll({ compareAsset, showSuccess, tabVisibility, refreshCallback }) {
    setDebounceForRequest(compareAsset, showSuccess, refreshCallback)
    setRefreshInterval(compareAsset, showSuccess, tabVisibility, refreshCallback)
}

export function setRefreshInterval(compareAsset, showSuccess, tabVisibility, refreshCallback) {
    removeRefreshInterval()

    if (compareAsset?.isSmartMode) {
        return
    }
    interval = setInterval(() => {
        if (!showSuccess && tabVisibility) {
            refreshCallback(compareAsset)
        }
    }, 10000)
}

export function setSmartRefreshTimeout(compareAsset, showSuccess, tabVisibility, refreshCallback) {
    removeRefreshInterval()

    if (compareAsset?.isSmartMode) {
        timeout = setTimeout(() => {
            if (!showSuccess && tabVisibility) {
                refreshCallback(compareAsset)
            }
        }, 10000)
    }
}

export function setDebounceForRequest(compareAsset, showSuccess, refreshCallback) {
    const { amounts, swapMode } = compareAsset

    removeRefreshDebounce()
    debounce = setTimeout(() => {
        if (
            (amounts?.first > 0 && swapMode === "default") ||
            (amounts?.second > 0 && swapMode === "reverse" && !showSuccess)
        ) {
            refreshCallback(compareAsset)
        }
    }, 200)
}