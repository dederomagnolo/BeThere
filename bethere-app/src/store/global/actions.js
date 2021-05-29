import { Notification } from '../global/interfaces';

export function setGlobalLoading(payload) {
    return {
      type: "SET_GLOBAL_LOADING",
      payload
    }
  }

export function setGlobalError(payload) {
  return {
    type: "SET_GLOBAL_ERROR",
    payload
  }
}

export function showNotification(message) {
  return {
    type: "SHOW_GLOBAL_NOTIFICATION",
    message
  }
}

export function clearNotification() {
  return { type: "CLEAR_GLOBAL_NOTIFICATION" }
}

export function clearGlobalState() {
  return {
    type: "CLEAR_GLOBAL_STATE"
  }
}