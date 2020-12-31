import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { S3 } from 'aws-sdk';

import { BookItem } from "../models/BookItem";
import { UpdateBookRequest } from "../requests/UpdateBookRequest";
import { createLogger } from "../utils/logger"


const logger = createLogger('bookAccess');
const XAWS = AWSXRay.captureAWS(AWS);


export class BookAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly s3: S3 = new XAWS.S3( { signatureVersion: 'v4' }),
        private readonly booksTable = process.env.BOOKS_TABLE,
        private readonly createdAtIndex = process.env.CREATED_AT_INDEX,
        private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {

    }


    async getBook(userId: string, bookId: string): Promise<BookItem> {
        logger.info(`Getting book with id: ${bookId} for user: ${userId}`);

        try {
            const result = await this.docClient.get({
                TableName: this.booksTable,
                Key: {
                    userId,
                    bookId
                }
            }).promise();

            logger.info(`Got book successfully`);

            return result.Item as BookItem;
        }
        catch(error) {
            logger.error(`Failed to get book#${bookId} from DB`, {
                error
            });
        }        
    }


    async getBooks(userId: string): Promise<BookItem[]> {
        logger.info(`Getting all books for user: ${userId}`);

        try {
            const result = await this.docClient.query({
                TableName: this.booksTable,
                IndexName: this.createdAtIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                },
                ScanIndexForward: false
            }).promise();
            
            const books = result.Items;

            logger.info(`Got all books`,  {
                items: books
            })

            return books as BookItem[];
        }
        catch(error) {
            logger.error(`Failed to get books from DB`, {
                error
            });
        }
    }


    async createBook(book: BookItem): Promise<BookItem> {
        logger.info(`Creating book with id: ${book.bookId} for user: ${book.userId}`);

        try {
            await this.docClient.put({
                TableName: this.booksTable,
                Item: book
            }).promise();

            logger.info(`Created book successfully`);

            return book as BookItem;
        }
        catch(error) {
            logger.error(`Failed to create book in DB`, {
                error
            });
        }
    }


    async deleteBook(userId: string, bookId: string) {
        logger.info(`Delete book with id: ${bookId} for user: ${userId}`);

        try {
            await this.docClient.delete({
                TableName: this.booksTable,
                Key: {
                    userId,
                    bookId
                }
            }).promise();

            logger.info(`Deleted book successfully`);
        }
        catch(error) {
            logger.error(`Failed to delete book from DB`, {
                error
            });
        }
    }


    async updateBook(book: BookItem, updatedBook: UpdateBookRequest) {
        logger.info(`Update book with id: ${book.bookId} for use: ${book.bookId}`);

        try {
            await this.docClient.update({
                TableName: this.booksTable,
                Key: {
                    userId: book.userId,
                    bookId: book.bookId
                },
                UpdateExpression: "set title = :title, author = :author, description = :description, #R = :read, rating = :rating",
                ExpressionAttributeValues: {
                    ":title": updatedBook.title,
                    ":author": updatedBook.author,
                    ":description": updatedBook.description,
                    ":read": updatedBook.read,
                    ":rating": updatedBook.rating
                },
                ExpressionAttributeNames: {
                    "#R": "read"
                }  
            }).promise();

            logger.info(`Updated book successfully`);
        }
        catch(error) {
            logger.error(`Failed to update book in DB`, {
                error
            });
        }

    }


    generatePreSignedUploadUrl(bookId: string) {
        logger.info(`Getting pre-signed url for bookId: ${bookId}`);

        try {
            return this.s3.getSignedUrl('putObject', {
                Bucket: this.bucketName,
                Key: bookId,
                Expires: this.urlExpiration
            })
        }
        catch(error) {
            logger.error(`Failed to get pre-signed url for upload`, {
                error
            });
        }
    }

    async updateAttachmentUrl(userId: string, bookId: string) {
        logger.info(`Updating attachmentUrl of bookId: ${bookId} for userId: ${userId}`);

        const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${bookId}`;

        try {
            await this.docClient.update({
                TableName: this.booksTable,
                Key: {
                    userId,
                    bookId
                },
                UpdateExpression: "set attachmentUrl = :attachmentUrl",
                ExpressionAttributeValues: {
                    ":attachmentUrl": attachmentUrl
                }
            }).promise();

            logger.info(`Update book with attachment url successfully`);
        }
        catch(error) {
            logger.error(`Failed to update book with attachment url`, {
                error
            });
        }
    }
}