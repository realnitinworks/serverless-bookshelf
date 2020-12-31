import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { UpdateBookRequest } from '../../requests/UpdateBookRequest'
import { getUserId } from "../utils"
import { BookItem } from "../../models/BookItem"
import { updateBook, getBook } from "../../businessLogic/books"


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);

  const userId = getUserId(event);
  const bookId = event.pathParameters.bookId;
  const updatedBook: UpdateBookRequest = JSON.parse(event.body);

  const book: BookItem = await getBook(userId, bookId);
  console.log("Book: ", book);

  if (!book) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        "error": `book#${bookId} does not exist`
      })
    }
  }

  await updateBook(book, updatedBook);

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
