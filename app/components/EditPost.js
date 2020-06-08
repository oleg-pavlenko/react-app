import React, { useEffect, useContext } from 'react';
import { Link, useParams, withRouter } from 'react-router-dom';
import { useImmerReducer } from 'use-immer';
import Axios from 'axios';
import PropTypes from 'prop-types';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';
import Page from './Page';
import LoadingDotsIcon from './LoadingDotsIcon';
import NotFound from './NotFound';

function EditPost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const initialState = {
    id: useParams().id,
    title: {
      value: '',
      hasErrors: false,
      message: '',
    },
    body: {
      value: '',
      hasErrors: false,
      message: '',
    },
    isFetching: true,
    isSaving: false,
    sendCount: 0,
    notFound: false,
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'fetchComplete':
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        break;
      case 'titleChange':
        draft.title.hasErrors = false;
        draft.title.value = action.value;
        break;
      case 'bodyChange':
        draft.body.hasErrors = false;
        draft.body.value = action.value;
        break;
      case 'submitRequest':
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount += 1;
        }
        break;
      case 'saveRequestStarted':
        draft.isSaving = true;
        break;
      case 'saveRequestFinished':
        draft.isSaving = false;
        break;
      case 'titleRules':
        if (!action.value.trim()) {
          draft.title.hasErrors = true;
          draft.title.message = 'You must provide a title.';
        }
        break;
      case 'bodyRules':
        if (!action.value.trim()) {
          draft.body.hasErrors = true;
          draft.body.message = 'Textarea should not be empty.';
        }
        break;
      case 'notFound':
        draft.notFound = true;
        break;
      default:
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: 'titleRules', value: state.title.value });
    dispatch({ type: 'bodyRules', value: state.body.value });
    dispatch({ type: 'submitRequest' });
  }

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token });
        if (response.data) {
          dispatch({ type: 'fetchComplete', value: response.data });
          if (appState.user.username !== response.data.author.username) {
            appDispatch({ type: 'flashMessage', value: 'You do not have permission to edit that post' });
            // redirect to homepage
            props.history.push('/');
          }
        } else {
          dispatch({ type: 'notFound' });
        }
      } catch (e) {
        console.log('There was a problem or the request was canceled.');
      }
    }
    fetchPost();
    // Cleanup function to cancel all asynchronous tasks
    return () => {
      ourRequest.cancel();
    };
  }, []);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await Axios.post(
          `/post/${state.id}/edit`,
          { title: state.title.value, body: state.body.value, token: appState.user.token },
          { cancelToken: ourRequest.token },
        );
        dispatch({ type: 'saveRequestFinished' });
        appDispatch({ type: 'flashMessage', value: 'Congrats! You successfully updated a post.' });
      } catch (e) {
        console.log('There was a problem or the request was canceled.');
      }
    }
    if (state.sendCount) {
      dispatch({ type: 'saveRequestStarted' });
      fetchPost();
      // Cleanup function to cancel all asynchronous tasks
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.sendCount]);

  if (state.notFound) {
    return (
      <NotFound />
    );
  }

  if (state.isFetching) {
    return (
      <Page>
        <LoadingDotsIcon />
      </Page>
    );
  }
  return (
    <Page title="Edit Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>&laquo; Back to post permalink</Link>
      <form className="mt-3" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            onChange={(e) => dispatch({ type: 'titleChange', value: e.target.value })}
            onBlur={(e) => dispatch({ type: 'titleRules', value: e.target.value })}
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
            value={state.title.value}
          />
          {
            state.title.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.message}
            </div>
            )
          }
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            onChange={(e) => dispatch({ type: 'bodyChange', value: e.target.value })}
            onBlur={(e) => dispatch({ type: 'bodyRules', value: e.target.value })}
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            value={state.body.value}
          />
          {
            state.body.hasErrors && (
              <div className="alert alert-danger small liveValidateMessage">
                {state.body.message}
              </div>
            )
          }
        </div>

        <button
          className="btn btn-primary"
          disabled={state.isSaving || state.title.hasErrors || state.body.hasErrors}
          type="submit"
        >
          {state.isSaving ? 'Saving...' : 'Save Updates'}
        </button>
      </form>
    </Page>
  );
}

EditPost.propTypes = {
  history: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired,
};

export default withRouter(EditPost);
