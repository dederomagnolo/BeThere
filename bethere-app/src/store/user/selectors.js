export const getToken = (state) => {
  return state.user.token;
};

export const getUserInformation = (state) => {
  return state.user;
};

export const getUserId = (state) => {
  return state.user._id;
}

export const getUserDevices = (state) => {
  return state.user.devices;
}
