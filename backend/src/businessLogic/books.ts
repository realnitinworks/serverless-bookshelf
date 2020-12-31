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