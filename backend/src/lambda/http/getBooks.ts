import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'


import { getUserId } from "../utils"
import { getBooks } from "../../businessLogic/books"
import { BookItem } from "../../models/BookItem"


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);

  const userId = getUserId(event);
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
