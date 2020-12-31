import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateBookRequest } from '../../requests/CreateBookRequest'
import  { getUserId } from "../utils"
import { createBook } from '../../businessLogic/books'
import { BookItem } from '../../models/BookItem'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);

  const createBookRequest: CreateBookRequest = JSON.parse(event.body);
  const userId = getUserId(event);
  const newBook: BookItem = await createBook(userId, createBookRequest);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: newBook
    })
  }
}
