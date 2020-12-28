/**
 * Fields in a request to update a single Book item.
 */
export interface UpdateBookRequest {
  title: string
  author: string
  description: string
  read: boolean
  rating: number
}