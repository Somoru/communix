import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';

const RecentActivity = () => {
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await axios.get(`${config.apiBaseUrl}/activity`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setActivity(res.data);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      }
    };

    fetchActivity();
  }, []);

  if (!activity) {
    return <div>Loading recent activity...</div>;
  }

  return (
    <div>
      <h3>Recent Activity</h3>
      <ul>
        <li>New Users: {activity.recentRegistrations.length}</li>
        <li>Join Requests: {activity.recentJoinRequests.length}</li>
        <li>New Posts: {activity.recentPosts.length}</li>
        <li>Reported Posts: {activity.recentReports.length}</li>
      </ul>
    </div>
  );
};

export default RecentActivity;
