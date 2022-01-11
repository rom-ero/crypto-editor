/* eslint-disable prettier/prettier */
function createErrorTime() {

    const date = new Date();

    return date.toLocaleTimeString() + `.${date.getMilliseconds()}`
}

export function createRequestError(error, symbol) {

    return {

        time: createErrorTime(),
        symbol: symbol,
        errorMessage:
            "Request failed with status code " +
            error,
    }
}

export function createCurrencyError(symbol) {

    return {

        time: createErrorTime(),
        symbol: "",
        errorMessage:
            "There is no currency with symbol " + symbol,
    }
}

export function createResponseError(error, symbol) {
    let response = error.response;

    return {

        time: createErrorTime(),
        symbol: symbol,
        errorMessage:
            "Request failed with status code " +
            response.status +
            ": " +
            response.data.error,
    }
}

export function createError(error) {

    return {

        time: createErrorTime(),
        symbol: "",
        errorMessage: error.message,
    }
}
