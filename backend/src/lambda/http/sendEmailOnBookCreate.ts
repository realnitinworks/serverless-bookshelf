import 'source-map-support/register'
import { DynamoDBStreamEvent } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'


import { createLogger } from "../../utils/logger"
import { emailOnBookCreate } from "../../businessLogic/books"


const logger = createLogger('sendEmail');


export const handler = middy(async (event: DynamoDBStreamEvent) => {
    logger.info("Processing event for sending email", {
        event
    });

    for (const record of event.Records) {
        logger.info("Processing record", {
            record
        });

        if (record.eventName !== 'INSERT') {
            continue;
        }

        // Get record from DynamoDB stream
        const newBook = record.dynamodb.NewImage;
        await emailOnBookCreate(newBook);
    }
});


handler.use(
    cors({
        credentials: true
    })
);