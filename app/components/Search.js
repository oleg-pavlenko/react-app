import React, { useEffect, useContext } from 'react';
import { useImmer } from 'use-immer';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import DispatchContext from '../DispatchContext';
import Post from './Post';

function Search() {
  const appDispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    searchTerm: '',
    results: [],
    show: 'neither',
    requestCount: 0,
  });

  function handleCloseSearch() {
    appDispatch({ type: 'closeSearch' });
  }

  function handleKeyDown(e) {
    if (e.keyCode === 27) {
      handleCloseSearch();
    }
  }

  function handleInput(e) {
    const { value } = e.target;
    setState((draft) => {
      draft.searchTerm = value;
    });
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Function that will run when this component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState((draft) => {
        draft.show = 'loading';
      });
      const delay = setTimeout(() => {
        setState((draft) => {
          draft.requestCount += 1;
        });
      }, 750);
      // Clears timeout each time component rerenders (searchTerm changes)
      return () => clearTimeout(delay);
    }
    setState((draft) => {
      draft.show = 'neither';
    });
  }, [state.searchTerm]);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchResults() {
      try {
        const response = await Axios.post(
          '/search',
          { searchTerm: state.searchTerm },
          { cancelToken: ourRequest.token },
        );
        setState((draft) => {
          draft.results = response.data;
          draft.show = 'results';
        });
      } catch (e) {
        console.log('There was a problem or the request was canceled.');
      }
    }
    if (state.requestCount) {
      fetchResults();
      // Cleanup function to cancel all asynchronous tasks
    }
    return () => ourRequest.cancel();
  }, [state.requestCount]);

  return (
    <>
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search" />
          </label>
          <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={handleCloseSearch} role="button" className="close-live-search">
            <i className="fas fa-times-circle" />
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={`circle-loader ${state.show === 'loading' ? 'circle-loader--visible' : ''}`} />
          <div className={`live-search-results ${state.show === 'results' ? 'live-search-results--visible' : ''}`}>
            {
              Boolean(state.results.length) && (
                <div className="list-group shadow-sm">
                  <div className="list-group-item active">
                    <strong>Search Results</strong>
                    {' '}
                    (
                    {state.results.length}
                    {' '}
                    {state.results.length > 1 ? 'items' : 'item'}
                    {' '}
                    found)
                  </div>
                  {state.results.map((post) => (
                    <Post post={post} key={post._id} onClick={handleCloseSearch} />
                  ))}
                </div>
              )
            }
            {
              !state.results.length && (
              <p className="alert alert-danger text-center shadow-sm">
                Sorry, we could not find any results for that search.
              </p>
              )
            }
          </div>
        </div>
      </div>
    </>
  );
}

export default Search;
