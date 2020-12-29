import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateBookRequest } from '../../requests/CreateBookRequest'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'


const docClient = new AWS.DynamoDB.DocumentClient();
const booksTable = process.env.BOOKS_TABLE;


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);

  const newBook: CreateBookRequest = JSON.parse(event.body);
  const userId = "123";
  const bookId = uuid.v4();
  const createdAt = new Date().toISOString();
  const read = false;
  const rating = 0;
  const title = newBook.title;
  const author = !newBook.author ? "Unknown": newBook.author;
  const description = !newBook.description ? "" : newBook.description;


  const newItem = {
    userId,
    bookId,
    createdAt,
    title,
    author,
    description,
    read,
    rating
  }

  await docClient.put({
    TableName: booksTable,
    Item: newItem
  }).promise();


  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem
    })
  }
}
