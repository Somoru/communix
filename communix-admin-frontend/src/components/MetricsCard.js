import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const MetricsCard = ({ title, value }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
