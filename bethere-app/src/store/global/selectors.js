export const getGlobalLoading = (state) => {
    return state.global.loading;
};

export const getGlobalError = (state) => {
    return state.global.error;
}

export const getGlobalErrorMessage = (state) => {
    return state.global.errorMessage;
}

export const getShowNotification = (state) => {
    return state.global.notification.showNotification;
};

export const getNotificationMessage = (state) => {
    return state.global.notification.message;
}