import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, patchBook } from '../api/books-api'
import { UpdateBookRequest } from '../types/UpdateBookRequest'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditBookProps {
  match: {
    params: {
      bookId: string
    }
  }
  auth: Auth
}

interface EditBookState {
  title: string
  author: string
  description: string
  rating: number
  file: any
  uploadState: UploadState
}

export class EditBook extends React.PureComponent<
  EditBookProps,
  EditBookState
> {
  state: EditBookState = {
    title: "",
    author: "",
    description: "",
    rating: 0,
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value;
  
    this.setState({
      title
    })
  }

  handleAuthorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const author = event.target.value;

    this.setState({
      author
    })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const description = event.target.value;

    this.setState({
      description
    })
  }

  handleRatingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rating = parseInt(event.target.value);
  
    this.setState({
      rating
    })
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    let updatedBook: UpdateBookRequest = {};
    if (this.state.title) {
      updatedBook.title = this.state.title
    }
    if (this.state.author) {
      updatedBook.author = this.state.author
    }
    if (this.state.description) {
      updatedBook.description = this.state.description
    }
    if (this.state.rating) {
      updatedBook.rating = this.state.rating
    }

    try {
      await patchBook(this.props.auth.getIdToken(), this.props.match.params.bookId, updatedBook)
      alert('Book updated successfully!');
    }
    catch(e) {
      alert('Could not update book: ' + e.message)
    }

    if (this.state.file) {
      try {
        this.setUploadState(UploadState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.bookId)

        this.setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, this.state.file)

        alert('File was uploaded!')
      } catch (e) {
        alert('Could not upload a file: ' + e.message)
      } finally {
        this.setUploadState(UploadState.NoUpload)
      }
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Edit Book</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Title</label>
            <input
              type="text"
              name="title"
              onChange={this.handleTitleChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Author</label>
            <input
              type="text"
              name="author"
              onChange={this.handleAuthorChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Description</label>
            <input
              type="text"
              name="description"
              onChange={this.handleDescriptionChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Rating</label>
            <input
              type="text"
              name="rating"
              onChange={this.handleRatingChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Image</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Update
        </Button>
      </div>
    )
  }
}
