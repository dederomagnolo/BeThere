export function setToken(payload) {
    return {
      type: "SET_TOKEN",
      payload
    }
}

export function setUserInfo(payload) {
  return {
    type: "SET_USER_INFO",
    payload
  }
}

export function clearUserState() {
  return {
    type: "CLEAR_USER_STATE"
  }
}


  