import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateBookRequest } from '../../requests/UpdateBookRequest'
import * as AWS from 'aws-sdk'


const docClient = new AWS.DynamoDB.DocumentClient();
const booksTable = process.env.BOOKS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);

  const userId = "123";
  const bookId = event.pathParameters.bookId;
  const updatedBook: UpdateBookRequest = JSON.parse(event.body);

  const result = await docClient.get(({
    TableName: booksTable,
    Key: {
      userId,
      bookId
    }
  })).promise();

  const book = result.Item;
  console.log("Book: ", book);

  if (!book) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        "error": `book#${bookId} does not exist`
      })
    }
  }

  const title = updatedBook.title === undefined ? book.title : updatedBook.title;
  const author = updatedBook.author === undefined ? book.author : updatedBook.author;
  const description = updatedBook.description === undefined ? book.description : updatedBook.description;
  const read = updatedBook.read === undefined ? book.read : updatedBook.read;
  const rating = updatedBook.rating === undefined ? book.rating : updatedBook.rating;

  await docClient.update({
    TableName: booksTable,
    Key: {
      userId,
      bookId
    },
    UpdateExpression: "set title = :title, author = :author, description = :description, #R = :read, rating = :rating",
    ExpressionAttributeValues: {
      ":title": title,
      ":author": author,
      ":description": description,
      ":read": read,
      ":rating": rating
    },
    ExpressionAttributeNames: {
      "#R": "read"
    }
  }).promise();

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ""
  }
}
