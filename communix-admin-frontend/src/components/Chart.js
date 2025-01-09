import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Chart = ({ title, data, dataKey }) => {
  return (
    <div style={{ height: 300 }}>
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey={dataKey} stroke="#1976d2" />
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
