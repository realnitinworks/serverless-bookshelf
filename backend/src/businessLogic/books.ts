import * as uuid from 'uuid'

import { BookItem } from "../models/BookItem";
import { CreateBookRequest } from "../requests/CreateBookRequest"
import { BookAccess } from "../dataLayer/bookAccess";
import { UpdateBookRequest } from '../requests/UpdateBookRequest';


const bookAccess = new BookAccess();


export async function getBook(userId: string, bookId: string): Promise<BookItem> {
    return bookAccess.getBook(userId, bookId);
}


export async function getBooks(userId: string): Promise<BookItem[]> {
    return bookAccess.getBooks(userId);
}


export async function createBook(
    userId: string,
    createBookRequest: CreateBookRequest
): Promise<BookItem> {

    const bookId: string = uuid.v4();
    const createdAt: string = new Date().toISOString();
    const read: boolean = false;
    const rating: number = 0;
    const title: string = createBookRequest.title;
    const author: string = !createBookRequest.author ? "Unknown" : createBookRequest.author;
    const description: string = !createBookRequest.description ? "" : createBookRequest.description;

    const newBook: BookItem = {
        userId,
        bookId,
        createdAt,
        title,
        author,
        description,
        read,
        rating
    }

    return bookAccess.createBook(newBook);
}


export async function deleteBook(userId: string, bookId: string) {
    await bookAccess.deleteBook(userId, bookId);
}


export async function updateBook(
    book: BookItem,
    updatedBook: UpdateBookRequest
) {
   
    updatedBook.title = updatedBook.title === undefined ? book.title : updatedBook.title;
    updatedBook.author = updatedBook.author === undefined ? book.author : updatedBook.author;
    updatedBook.description = updatedBook.description === undefined ? book.description : updatedBook.description;
    updatedBook.read = updatedBook.read === undefined ? book.read : updatedBook.read;
    updatedBook.rating = updatedBook.rating === undefined ? book.rating : updatedBook.rating;

    await bookAccess.updateBook(book, updatedBook);
}


export function generatePreSignedUploadUrl(bookId: string) {
    return bookAccess.generatePreSignedUploadUrl(bookId);
}


export async function updateAttachmentUrl(userId: string, bookId: string) {
    await bookAccess.updateAttachmentUrl(userId, bookId);
}


export async function emailOnBookCreate(newBook) {
    const email: string = newBook.userId.S;
    const title: string = newBook.title.S;
    const text: string = `A new book "${title}" has been added to your bookshelf. 
                        Consider updating author and description. You can also rate the book and mark it as read.`;
    const subject: string = "New Book Added";

    await bookAccess.sendEmail(email, subject, text);
}