import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { S3 } from 'aws-sdk';

import { BookItem } from "../models/BookItem";
import { UpdateBookRequest } from "../requests/UpdateBookRequest";


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
        console.log(`Getting book with id: ${bookId} for user: ${userId}`);

        const result = await this.docClient.get({
            TableName: this.booksTable,
            Key: {
                userId,
                bookId
            }
        }).promise();

        return result.Item as BookItem;
    }


    async getBooks(userId: string): Promise<BookItem[]> {
        console.log(`Getting all books for user: ${userId}`);

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

        return books as BookItem[];
    }


    async createBook(book: BookItem): Promise<BookItem> {
        console.log(`Creating book with id: ${book.bookId} for user: ${book.userId}`);

        await this.docClient.put({
            TableName: this.booksTable,
            Item: book
        }).promise();

        return book as BookItem;
    }


    async deleteBook(userId: string, bookId: string) {
        console.log(`Delete book with id: ${bookId} for user: ${userId}`);

        await this.docClient.delete({
            TableName: this.booksTable,
            Key: {
                userId,
                bookId
            }
        }).promise();
    }


    async updateBook(book: BookItem, updatedBook: UpdateBookRequest) {
        console.log(`Update book with id: ${book.bookId} for use: ${book.bookId}`);

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
    }


    generatePreSignedUploadUrl(bookId: string) {
        console.log(`Getting pre-signed url for bookId: ${bookId}`);

        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: bookId,
            Expires: this.urlExpiration
        })
    }

    async updateAttachmentUrl(userId: string, bookId: string) {
        console.log(`Updating attachmentUrl of bookId: ${bookId} for userId: ${userId}`);

        const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${bookId}`;

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
    }
}