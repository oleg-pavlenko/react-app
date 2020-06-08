import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';

function HeaderLoggedIn() {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  function handleLogOut() {
    appDispatch({ type: 'logout' });
    appDispatch({ type: 'flashMessage', value: 'You have successfully logged out.' });
  }

  function handleSearch(e) {
    e.preventDefault();
    appDispatch({ type: 'openSearch' });
  }

  function toggleChat() {
    appDispatch({ type: 'toggleChat' });
  }

  return (
    <div className="flex-row my-3 my-md-0">
      <a onClick={handleSearch} data-tip="Search" data-for="search" href="#" className="text-white mr-2 header-search-icon">
        <i className="fas fa-search" />
      </a>
      <ReactTooltip place="bottom" id="search" className="custom-tooltip" />
      {' '}
      <span
        onClick={toggleChat}
        role="button"
        className={`mr-2 header-chat-icon ${appState.unreadChatCount ? 'text-danger' : 'text-white'}`}
        data-tip="Chat"
        data-for="chat"
      >
        <i className="fas fa-comment" />
        {
          appState.unreadChatCount
            ? (
              <span className="chat-count-badge text-white">
                {appState.unreadChatCount > 9 ? '9+' : appState.unreadChatCount}
              </span>
            )
            : ''
        }
      </span>
      <ReactTooltip place="bottom" id="chat" className="custom-tooltip" />
      {' '}
      <Link to={`/profile/${appState.user.username}`} className="mr-2" data-tip="Profile" data-for="profile">
        <img className="small-header-avatar" src={appState.user.avatar} alt="avatar" />
      </Link>
      <ReactTooltip place="bottom" id="profile" className="custom-tooltip" />
      <Link to="/create-post" className="btn btn-sm btn-success mr-2">
        Create Post
      </Link>
      <button onClick={handleLogOut} className="btn btn-sm btn-secondary" type="button">
        Log Out
      </button>
    </div>
  );
}

export default HeaderLoggedIn;
