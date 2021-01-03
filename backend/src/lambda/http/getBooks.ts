import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'


import { getEmail } from "../utils"
import { getBooks } from "../../businessLogic/books"
import { BookItem } from "../../models/BookItem"
import { createLogger } from "../../utils/logger"


const logger = createLogger('getBooks');


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("Processing event for getting all books", {
    event
  });

  const userId = getEmail(event);
  const books: BookItem[] = await getBooks(userId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: books
    })
  }
});


handler.use(
  cors({
    credentials: true
  })
);
