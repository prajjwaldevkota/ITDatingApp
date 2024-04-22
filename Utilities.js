/**
 * Contains common utilty functions used across this application
 */

import jwt from "jsonwebtoken";
import * as cfg from "./config.js";
import { getAuthorizationHeader } from "./sharedData.js";

/**Gets userId based on Authorization header and token */
const authorizeAndGetUserId = async () => {
  try {
    const authorizationHeader = getAuthorizationHeader();
    if (!authorizationHeader) {
      throw new Error("Authorization header not found.");
    }
    // Extract the token from the authorization header
    const token = authorizationHeader.replace("Bearer ", "");
    // Decode the token to get the user ID
    const decodedToken = jwt.verify(token, cfg.jwtSecret);
    const userId = decodedToken.userId;
    return userId;
  } catch (err) {
    console.error("Error when trying to authorize and get userId ");
    console.log(err);
  }
};

export { authorizeAndGetUserId };
