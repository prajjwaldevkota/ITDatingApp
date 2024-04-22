// sharedData.js
let authorizationHeader;

export const setAuthorizationHeader = (header) => {
  authorizationHeader = header;
};

export const getAuthorizationHeader = () => {
  return authorizationHeader;
};
