import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect } from 'react'
import { Grid } from 'semantic-ui-react'
import ActivityList from './ActivityList'
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { RootStoreContext } from '../../../app/stores/rootStore';

const ActivityDashboard: React.FC = () => {
    const rootStore = useContext(RootStoreContext);
    const {loadingActivities, loadingInitial} = rootStore.activityStore

    useEffect(() => {
        loadingActivities();
    }, [loadingActivities]);

    if (loadingInitial) return <LoadingComponent content='Loading activities...' />
    
    return (
        <Grid>
            <Grid.Column width={10}>
                <ActivityList />
            </Grid.Column>
            <Grid.Column width={6}>
                <h2>Activty filters</h2>
            </Grid.Column>
        </Grid>
    );
};

export default observer(ActivityDashboard);
