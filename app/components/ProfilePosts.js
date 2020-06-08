import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Axios from 'axios';
import LoadingDotsIcon from './LoadingDotsIcon';
import Post from './Post';

function ProfilePosts() {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPosts() {
      try {
        const response = await Axios.get(
          `/profile/${username}/posts`,
          { cancelToken: ourRequest.token },
        );
        setPosts(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log('There was a problem or the request was canceled.');
      }
    }
    fetchPosts();
    // Cleanup function to cancel all asynchronous tasks
    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  if (isLoading) return <LoadingDotsIcon />;

  return (
    <div className="list-group">
      {
        posts.map((post) => (
          <Post noAuthor post={post} key={post._id} />
        ))
      }
    </div>
  );
}

export default ProfilePosts;
