import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createBook, deleteTodo, getTodos, patchBook } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Book } from '../types/Book'

interface BooksProps {
  auth: Auth
  history: History
}

interface BooksState {
  books: Book[]
  newBookName: string
  loadingTodos: boolean
}

export class Books extends React.PureComponent<BooksProps, BooksState> {
  state: BooksState = {
    books: [],
    newBookName: '',
    loadingTodos: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookName: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onBookCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const author = "Unknown";
      const description = "No description yet";
      const newBook = await createBook(this.props.auth.getIdToken(), {
        title: this.state.newBookName,
        author,
        description
      })
      this.setState({
        books: [newBook, ...this.state.books],
        newBookName: ''
      })
    } catch {
      alert('Book creation failed')
    }
  }

  onTodoDelete = async (bookId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), bookId)
      this.setState({
        books: this.state.books.filter(book => book.bookId != bookId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const book = this.state.books[pos]
      await patchBook(this.props.auth.getIdToken(), book.bookId, {
        title: book.title,
        author: book.author,
        read: !book.read
      })
      this.setState({
        books: update(this.state.books, {
          [pos]: { read: { $set: !book.read } }
        })
      })
    } catch {
      alert('Toggling book read/unread failed')
    }
  }

  async componentDidMount() {
    try {
      const books = await getTodos(this.props.auth.getIdToken())
      this.setState({
        books,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">My BookShelf</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Book',
              onClick: this.onBookCreate
            }}
            fluid
            actionPosition="left"
            placeholder="A book you just found..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.books.map((todo, pos) => {
          return (
            <Grid.Row key={todo.bookId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={todo.read}
                />
              </Grid.Column>
              <Grid.Column width={6} verticalAlign="middle">
                {todo.title}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.author}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.description}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                {todo.rating}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.bookId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.bookId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
