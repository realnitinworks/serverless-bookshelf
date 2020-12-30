import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { getUserId } from "../utils"


const docClient = new AWS.DynamoDB.DocumentClient();
const booksTable = process.env.BOOKS_TABLE;
const createdAtIndex = process.env.CREATED_AT_INDEX;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);

  const userId = getUserId(event);
  const result = await docClient.query({
    TableName: booksTable,
    IndexName: createdAtIndex,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false
  }).promise();

  const items = result.Items;

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}
