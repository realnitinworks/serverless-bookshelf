import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from "../utils"
import { deleteBook, getBook } from '../../businessLogic/books'
import { BookItem } from '../../models/BookItem'




export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);
  
  const userId: string = getUserId(event);
  const bookId: string = event.pathParameters.bookId;

  const book: BookItem = await getBook(userId, bookId);
  if (!book) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        "error": `book#${bookId} does not exist`
      })
    }
  }

  await deleteBook(userId, bookId);

  return {
    statusCode: 200,
    body: ""
  }
});


handler.use(
  cors({
    credentials: true
  })
);
