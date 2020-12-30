import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { getUserId } from "../utils"


const docClient = new AWS.DynamoDB.DocumentClient();
const booksTable = process.env.BOOKS_TABLE;


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);
  
  const userId = getUserId(event);
  const bookId = event.pathParameters.bookId;

  await docClient.delete({
    TableName: booksTable,
    Key: {
      userId,
      bookId
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
