import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { getUserId } from "../utils"


const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});
const booksTable = process.env.BOOKS_TABLE;
const bukcetName = process.env.ATTACHMENTS_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);

  const userId = getUserId(event);
  const bookId = event.pathParameters.bookId;
  const uploadUrl = generatePreSignedUploadUrl(bookId);
  await updateAttachmentUrl(userId, bookId);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}


function generatePreSignedUploadUrl(uniqueId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bukcetName,
    Key: uniqueId,
    Expires: urlExpiration
  })
}


async function updateAttachmentUrl(userId: string, bookId: string) {
  const attachmentUrl = `https://${bukcetName}.s3.amazonaws.com/${bookId}`;

  await docClient.update({
    TableName: booksTable,
    Key: {
      userId,
      bookId
    },
    UpdateExpression: "set attachmentUrl = :attachmentUrl",
    ExpressionAttributeValues: {
      ":attachmentUrl": attachmentUrl
    }
  }).promise();
}
