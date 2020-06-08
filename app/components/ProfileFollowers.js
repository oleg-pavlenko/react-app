import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Axios from 'axios';
import LoadingDotsIcon from './LoadingDotsIcon';

function ProfileFollowers() {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchFollowers() {
      try {
        const response = await Axios.get(
          `/profile/${username}/followers`,
          { cancelToken: ourRequest.token },
        );
        setFollowers(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log('There was a problem or the request was canceled.');
      }
    }
    fetchFollowers();
    // Cleanup function to cancel all asynchronous tasks
    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  if (isLoading) return <LoadingDotsIcon />;

  return (
    <div className="list-group">
      {
        followers.map((follower, index) => (
          <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
            <img alt="avatar" className="avatar-tiny" src={follower.avatar} />
            {follower.username}
          </Link>
        ))
      }
    </div>
  );
}

export default ProfileFollowers;
