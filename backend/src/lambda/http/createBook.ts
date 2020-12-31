import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { CreateBookRequest } from '../../requests/CreateBookRequest'
import  { getUserId } from "../utils"
import { createBook } from '../../businessLogic/books'
import { BookItem } from '../../models/BookItem'


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);

  const createBookRequest: CreateBookRequest = JSON.parse(event.body);
  const userId = getUserId(event);
  const newBook: BookItem = await createBook(userId, createBookRequest);

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