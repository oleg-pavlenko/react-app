import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams, withRouter } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import ReactTooltip from 'react-tooltip';
import Axios from 'axios';
import PropTypes from 'prop-types';
import Page from './Page';
import LoadingDotsIcon from './LoadingDotsIcon';
import NotFound from './NotFound';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';

function ViewSinglePost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, { cancelToken: ourRequest.token });
        setPost(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log('There was a problem or the request was canceled.');
      }
    }
    fetchPost();
    // Cleanup function to cancel all asynchronous tasks
    return () => {
      ourRequest.cancel();
    };
  }, [id]);

  if (!isLoading && !post) {
    return (
      <NotFound />
    );
  }

  if (isLoading) {
    return (
      <Page>
        <LoadingDotsIcon />
      </Page>
    );
  }
  const date = new Date(post.createdDate);
  const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username === post.author.username;
    }
    return false;
  }

  async function handleSubmit() {
    const areYouSure = window.confirm('Do you really want to delete this post?');
    if (areYouSure) {
      try {
        const response = await Axios.delete(
          `/post/${id}`,
          { data: { token: appState.user.token } },
        );
        if (response.data === 'Success') {
          // 1. Display a flash message
          appDispatch({ type: 'flashMessage', value: 'Post was successfully deleted' });
          // 2. Redirect back to the current user's profile
          props.history.push(`/profile/${appState.user.username}`);
        }
      } catch (e) {
        console.log('There was a problem.');
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {
          isOwner() && (
            <span className="pt-2">
              <Link to={`/post/${id}/edit`} data-tip="Edit" data-for="edit" className="text-primary mr-2">
                <i className="fas fa-edit" />
              </Link>
              <ReactTooltip id="edit" className="custom-tooltip" />
              {' '}
              <a onClick={handleSubmit} data-tip="Delete" data-for="delete" className="delete-post-button text-danger">
                <i className="fas fa-trash" />
              </a>
              <ReactTooltip id="delete" className="custom-tooltip" />
            </span>
          )
        }
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} alt="avatar" />
        </Link>
        Posted by
        {' '}
        <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link>
        {` on ${dateFormatted}`}
      </p>

      <div className="body-content">
        <ReactMarkdown
          source={post.body}
          allowedTypes={[
            'paragraph',
            'strong',
            'emphasis',
            'text',
            'heading',
            'list',
            'listItem',
          ]}
        />
      </div>
    </Page>
  );
}

// ViewSinglePost.propTypes = {
//   history: PropTypes.object.isRequired,
//   push: PropTypes.func.isRequired,
// };

export default withRouter(ViewSinglePost);
