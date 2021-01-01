export interface Book {
  bookId: string
  createdAt: string
  title: string
  author: string
  description: string
  read: boolean
  rating: number
  attachmentUrl?: string
}
