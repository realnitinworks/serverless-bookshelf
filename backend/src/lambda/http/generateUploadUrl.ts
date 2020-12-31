import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { getUserId } from "../utils"
import { generatePreSignedUploadUrl, updateAttachmentUrl } from "../../businessLogic/books"


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);

  const userId: string = getUserId(event);
  const bookId: string = event.pathParameters.bookId;
  const uploadUrl: string = generatePreSignedUploadUrl(bookId);
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
