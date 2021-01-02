import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId, parseEmail } from "../auth/utils";

/**
 * Get JWT token from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getToken(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  return split[1]; 
}


/**
 * Get user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const jwt = getToken(event);
  return parseUserId(jwt);
}


/**
 * Get email from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getEmail(event: APIGatewayProxyEvent): string {
  const jwt = getToken(event);
  return parseEmail(jwt);
}

