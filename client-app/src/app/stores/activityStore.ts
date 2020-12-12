import { observable, action, computed, runInAction } from 'mobx';
import { SyntheticEvent } from 'react';
import agent from '../api/agent';
import { IActivity } from '../models/activity';
import { makeObservable } from 'mobx';
import { history } from '../..';
import { toast } from 'react-toastify';
import { RootStore } from './rootStore';
import { createAttendee, setActivityProps } from '../common/util/util';

export default class ActivityStore {
    rootStore: RootStore;
    constructor(rootStore: RootStore) {
        makeObservable(this)
        this.rootStore = rootStore;
    }

    @observable activityRegistry = new Map();
    @observable activity: IActivity | null = null;
    @observable loadingInitial = false;
    @observable submitting = false;
    @observable target = '';
    @observable loading = false;

    @computed get activitiesByDate() {
        return this.groupActivityByDate(Array.from(this.activityRegistry.values()));
    }

    groupActivityByDate(activities: IActivity[]) {
        const sortedActivitities = activities.sort(
            (a, b) => a.date.getTime() - b.date.getTime()
        )
        return Object.entries(sortedActivitities.reduce((activities, activity) => {
            const date = activity.date.toISOString().split('T')[0];
            activities[date] = activities[date] ? [...activities[date], activity] : [activity];
            return activities;
        }, {} as { [key: string]: IActivity[] }));
    }

    @action loadingActivities = async () => {
        this.loadingInitial = true;
        try {
            const activities = await agent.Activities.list();
            runInAction(() => {
                activities.forEach(activity => {
                    setActivityProps(activity, this.rootStore.userStore.user!)
                    this.activityRegistry.set(activity.id, activity);
                });
            })
        } catch (error) {
            toast.error(error);
        }
        finally {
            runInAction(() => {
                this.loadingInitial = false;
            })
        }
    };

    @action loadActivity = async (id: string) => {
        let activity = this.getActivity(id);
        if (activity) {
            this.activity = activity;
            return activity;
        } else {
            this.loadingInitial = true;
            try {
                activity = await agent.Activities.details(id);
                runInAction(() => {
                    setActivityProps(activity, this.rootStore.userStore.user!);
                    this.activity = activity;
                    this.activityRegistry.set(activity.id, activity);
                });
                return activity;
            } catch (error) {
                toast.error(error);
            }
            finally {
                runInAction(() => {
                    this.loadingInitial = false;
                });
            }
        }
    };

    @action clearActivity = () => {
        this.activity = null;
    };

    getActivity = (id: string) => {
        return this.activityRegistry.get(id);
    };

    @action createActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.create(activity);
            const attendee = createAttendee(this.rootStore.userStore.user!);
            attendee.isHost = true;
            let attendees = [];
            attendees.push(attendee);
            activity.attendees = attendees;
            activity.isHost = true;
            runInAction(() => {
                this.activityRegistry.set(activity.id, activity);
            });
            history.push(`/activities/${activity.id}`)
        } catch (error) {
            toast.error('Problem submitting data!');
            console.log(error.response);
        }
        finally {
            runInAction(() => {
                this.submitting = false;
            })
        }
    };

    @action editActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.update(activity);
            runInAction(() => {
                this.activityRegistry.set(activity.id, activity);
                this.activity = activity;
            });
            history.push(`/activities/${activity.id}`)
        } catch (error) {
            toast.error('Problem submitting data!');
            console.log(error.response);
        }
        finally {
            runInAction(() => {
                this.submitting = false;
            })
        }
    };

    @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
        this.submitting = true;
        this.target = event.currentTarget.name;
        try {
            await agent.Activities.delete(id);
            runInAction(() => {
                this.activityRegistry.delete(id);
            })
        } catch (error) {
            toast.error(error);
        }
        finally {
            runInAction(() => {
                this.target = '';
                this.submitting = false;
            })
        }
    };

    @action attendActivity = async () => {
        const attendee = createAttendee(this.rootStore.userStore.user!);
        this.loading = true;
        try {
            await agent.Activities.attend(this.activity!.id);
            runInAction(() => {
                if (this.activity) {
                    this.activity.attendees.push(attendee);
                    this.activity.isGoing = true;
                    this.activityRegistry.set(this.activity.id, this.activity);
                    this.loading = false;
                }
            })
        } catch (error) {
            toast.error('Problem signing up to activity!');
        }
        finally {
            runInAction(() => {
                this.loading = false;
            })
        }
        
    }

    @action cancelAttendance = async () => {
        this.loading = true;
        try {
            await agent.Activities.unattend(this.activity!.id);
            runInAction(() => {
                if (this.activity) {
                    this.activity.attendees = this.activity.attendees.filter(
                        a => a.username !== this.rootStore.userStore.user!.userName
                    );
                    this.activity.isGoing = false;
                    this.activityRegistry.set(this.activity.id, this.activity);
                }
            })
        } catch (error) {
            toast.error('Problem cancelling attendance')
        }
        runInAction(() => {
            this.loading = false;
        })
    }
}