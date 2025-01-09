import React, { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import MetricsCard from '../components/MetricsCard';
import Chart from '../components/Chart';
import RecentActivity from '../components/RecentActivity';
import axios from 'axios';
import config from '../config';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [postFrequency, setPostFrequency] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [metricsRes, userGrowthRes, postFrequencyRes] = await Promise.all([
          axios.get(`${config.apiBaseUrl}/dashboard/metrics`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${config.apiBaseUrl}/dashboard/user-growth`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${config.apiBaseUrl}/dashboard/post-frequency`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);

        setMetrics(metricsRes.data);
        setUserGrowth(userGrowthRes.data);
        setPostFrequency(postFrequencyRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !metrics) {
    return <div>Loading...</div>; // Show loading until data is available
  }

  return (
    <div className="dashboard-container">
      <Typography variant="h4" className="dashboard-title">
        Dashboard Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <MetricsCard title="Total Users" value={metrics.totalUsers || 0} />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricsCard title="Active Communities" value={metrics.totalCommunities || 0} />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricsCard title="New Posts Today" value={metrics.newPosts || 0} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Chart title="User Growth" data={userGrowth} dataKey="count" />
        </Grid>
        <Grid item xs={12} md={6}>
          <Chart title="Post Frequency" data={postFrequency} dataKey="count" />
        </Grid>
        <Grid item xs={12}>
          <RecentActivity />
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
