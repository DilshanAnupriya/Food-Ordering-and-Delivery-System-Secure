import React from 'react';
import { useParams } from 'react-router-dom';
import DriverDeliveryPage from './DriverDeliveryPage';

const DriverDeliveryPageWrapper: React.FC = () => {
  const { driverId } = useParams<{ driverId: string }>();
  return <DriverDeliveryPage driverId={driverId} />;
};

export default DriverDeliveryPageWrapper;