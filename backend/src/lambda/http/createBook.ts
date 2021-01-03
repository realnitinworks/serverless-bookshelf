import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { CreateBookRequest } from '../../requests/CreateBookRequest'
import  { getEmail } from "../utils"
import { createBook } from '../../businessLogic/books'
import { BookItem } from '../../models/BookItem'
import { createLogger } from "../../utils/logger"


const logger = createLogger('createBook');


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("Processing event for creating a book", {
    event
  });

  const createBookRequest: CreateBookRequest = JSON.parse(event.body);
  const userId = getEmail(event);
  const newBook: BookItem = await createBook(userId, createBookRequest);

  console.log("Email of user = ", userId);

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: newBook
    })
  }
});


handler.use(
  cors({
    credentials: true
  })
);