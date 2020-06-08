import React, { useState, useContext } from 'react';
import Axios from 'axios';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import Page from './Page';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';

function CreatePost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const [title, setTitle] = useState();
  const [body, setBody] = useState();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await Axios.post(
        '/create-post',
        { title, body, token: appState.user.token },
      );
      appDispatch({
        type: 'flashMessage',
        value: 'Congrats! You successfully created a post.',
      });
      props.history.push(`/post/${response.data}`);
    } catch (error) {
      console.log('There was a problem.');
    }
  }
  return (
    <Page title="Create New Post">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onChange={(e) => setTitle(e.target.value)} name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onChange={(e) => setBody(e.target.value)} name="body" id="post-body" className="body-content tall-textarea form-control" type="text" />
        </div>

        <button className="btn btn-primary" type="submit">Save New Post</button>
      </form>
    </Page>
  );
}

CreatePost.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(CreatePost);
