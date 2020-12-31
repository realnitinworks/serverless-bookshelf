import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from "../utils"
import { generatePreSignedUploadUrl,
  updateAttachmentUrl,
  getBook
} from "../../businessLogic/books"
import { BookItem } from '../../models/BookItem'
import { createLogger } from "../../utils/logger"


const logger = createLogger('generateUploadUrl');


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("Processing event for generating presigned url for image upload", {
    event
  });

  const userId: string = getUserId(event);
  const bookId: string = event.pathParameters.bookId;

  const book: BookItem = await getBook(userId, bookId);
  if (!book) {
    logger.error(`book#${bookId} does not exist`);
    return {
      statusCode: 404,
      body: JSON.stringify({
        "error": `book#${bookId} does not exist`
      })
    }
  }

  const uploadUrl: string = generatePreSignedUploadUrl(bookId);
  if(uploadUrl) {
    await updateAttachmentUrl(userId, bookId);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl
    })
  }
});


handler.use(
  cors({
    credentials: true
  })
);
