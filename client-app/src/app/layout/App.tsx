import React, { useEffect, Fragment, useContext } from 'react';
import { Container } from 'semantic-ui-react'
import Navbar from '../../features/nav/Navbar';
import LoadingComponent from './LoadingComponent';
import ActivityStore from '../stores/activityStore';
import {observer} from 'mobx-react-lite'
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';

const App = () => {
  const activityStore = useContext(ActivityStore)

  useEffect(() => {
    activityStore.loadingActivities();
  }, [activityStore]);

  if (activityStore.loadingInitial) return <LoadingComponent content='Loading activities...' />

  return (
    <Fragment>
      <Navbar />
      <Container style={{ marginTop: '7em' }}>
        <ActivityDashboard />
      </Container>
    </Fragment>
  );
};

export default observer(App);
