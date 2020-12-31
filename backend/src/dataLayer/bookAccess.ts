import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { BookItem } from "../models/BookItem";
import { UpdateBookRequest } from "../requests/UpdateBookRequest";


export class BookAccess {

    constructor(
        private readonly docClient: DocumentClient = new DocumentClient(),
        private readonly booksTable = process.env.BOOKS_TABLE,
        private readonly createdAtIndex = process.env.CREATED_AT_INDEX
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
}