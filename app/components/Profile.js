import React, { useEffect, useContext } from 'react';
import {
  Switch,
  Route,
  NavLink,
  useParams,
} from 'react-router-dom';
import Axios from 'axios';
import { useImmer } from 'use-immer';
import StateContext from '../StateContext';
import Page from './Page';
import ProfilePosts from './ProfilePosts';
import ProfileFollowers from './ProfileFollowers';
import ProfileFollowing from './ProfileFollowing';

function Profile() {
  const appState = useContext(StateContext);
  const { username } = useParams();
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: '...',
      profileAvatar: 'https://gravatar.com/avatar/placeholder?s=128',
      isFollowing: false,
      counts: { postCount: '', followerCount: '', followingCount: '' },
    },
  });
  const ourRequest = Axios.CancelToken.source();

  function startFollowing() {
    setState((draft) => {
      draft.startFollowingRequestCount += 1;
    });
  }

  function stopFollowing() {
    setState((draft) => {
      draft.stopFollowingRequestCount += 1;
    });
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await Axios.post(
          `/profile/${username}`,
          { token: appState.user.token },
          { cancelToken: ourRequest.token },
        );
        setState((draft) => {
          draft.profileData = response.data;
        });
      } catch (e) {
        console.log('There was a problem or the request was canceled.');
      }
    }
    fetchData();
    // Cleanup function to cancel all asynchronous tasks
    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await Axios.post(
          `/addFollow/${state.profileData.profileUsername}`,
          { token: appState.user.token },
          { cancelToken: ourRequest.token },
        );
        setState((draft) => {
          draft.profileData.isFollowing = true;
          draft.profileData.counts.followerCount += 1;
          draft.followActionLoading = false;
        });
      } catch (e) {
        console.log('There was a problem or the request was canceled.');
      }
    }
    if (state.startFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });
      fetchData();
    }
    // Cleanup function to cancel all asynchronous tasks
    return () => {
      ourRequest.cancel();
    };
  }, [state.startFollowingRequestCount]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await Axios.post(
          `/removeFollow/${state.profileData.profileUsername}`,
          { token: appState.user.token },
          { cancelToken: ourRequest.token },
        );
        setState((draft) => {
          draft.profileData.isFollowing = false;
          draft.profileData.counts.followerCount -= 1;
          draft.followActionLoading = false;
        });
      } catch (e) {
        console.log('There was a problem or the request was canceled.');
      }
    }
    if (state.stopFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });
      fetchData();
    }
    // Cleanup function to cancel all asynchronous tasks
    return () => {
      ourRequest.cancel();
    };
  }, [state.stopFollowingRequestCount]);

  return (
    <Page title="Profile Screen">
      <h2>
        <img alt="avatar" className="avatar-small" src={state.profileData.profileAvatar} />
        {' '}
        {state.profileData.profileUsername}
        {
          appState.loggedIn
          && !state.profileData.isFollowing
          && appState.user.username !== state.profileData.profileUsername
          && state.profileData.profileUsername !== '...'
          && (
            <button onClick={startFollowing} disabled={state.followActionLoading} className="btn btn-primary btn-sm ml-2" type="button">
              Follow
              {' '}
              <i className="fas fa-user-plus" />
            </button>
          )
        }
        {
          appState.loggedIn
          && state.profileData.isFollowing
          && appState.user.username !== state.profileData.profileUsername
          && state.profileData.profileUsername !== '...'
          && (
            <button onClick={stopFollowing} disabled={state.followActionLoading} className="btn btn-danger btn-sm ml-2" type="button">
              Stop Following
              {' '}
              <i className="fas fa-user-times" />
            </button>
          )
        }
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink exact to={`/profile/${state.profileData.profileUsername}`} className="nav-item nav-link">
          Posts:
          {' '}
          {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/followers`} className="nav-item nav-link">
          Followers:
          {' '}
          {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/following`} className="nav-item nav-link">
          Following:
          {' '}
          {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route exact path="/profile/:username">
          <ProfilePosts />
        </Route>
        <Route path="/profile/:username/followers">
          <ProfileFollowers />
        </Route>
        <Route path="/profile/:username/following">
          <ProfileFollowing />
        </Route>
      </Switch>
    </Page>
  );
}

export default Profile;
