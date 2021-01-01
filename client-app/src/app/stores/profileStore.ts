import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { toast } from "react-toastify";
import agent from "../api/agent";
import { IPhoto, IProfile } from "../models/profile";
import { RootStore } from "./rootStore";

export default class ProfileStore {
    rootStore: RootStore;
    constructor(rootStore: RootStore) {
        makeObservable(this)
        this.rootStore = rootStore;
    };

    @observable profile: IProfile | null = null;
    @observable loadingProfile = true;
    @observable uploadingPhoto = false;
    @observable loading = false;

    @computed get isCurrentUser() {
        if (this.rootStore.userStore.user && this.profile) {
            return this.rootStore.userStore.user.userName === this.profile.userName;
        } else {
            return false;
        }
    };

    @action loadProfile = async (username: string) => {
        try {
            const profile = await agent.Profiles.get(username);
            runInAction(() => {
                this.profile = profile;
            })
        } catch (error) {
            console.log(error)
            toast.error('Problem loading data!');
        }
        finally {
            runInAction(() => {
                this.loadingProfile = false;
            })
        }
    };

    @action uploadPhoto = async (file: Blob) => {
        this.uploadingPhoto = true;
        try {
            const photo = await agent.Profiles.uploadPhoto(file);
            runInAction(() => {
                if (this.profile) {
                    this.profile.photos.push(photo);
                    if (photo.isMain && this.rootStore.userStore.user) {
                        this.rootStore.userStore.user.image = photo.url;
                        this.profile.image = photo.url;
                    }
                }
            })
        } catch (error) {
            console.log(error)
            toast.error('Problem uploading photo!');
        }
        finally {
            runInAction(() => {
                this.uploadingPhoto = false;
            });
        }
    };

    @action setMainPhoto = async (photo: IPhoto) => {
        this.loading = true;
        try {
            await agent.Profiles.setMainPhoto(photo.id);
            runInAction(() => {
                this.rootStore.userStore.user!.image = photo.url;
                this.profile!.photos.find(a => a.isMain)!.isMain = false;
                this.profile!.photos.find(a => a.id === photo.id)!.isMain = true;
                this.profile!.image = photo.url;
            })
        } catch (error) {
            console.log(error)
            toast.error('Problem setting photo as main!');
        }
        finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    };

    @action deletePhoto = async (photo: IPhoto) => {
        this.loading = true;
        try {
            await agent.Profiles.deletePhoto(photo.id);
            runInAction(() => {
                this.profile!.photos = this.profile!.photos.filter(a => a.id !== photo.id);
            })
        } catch (error) {
            console.log(error)
            toast.error('Problem deleting photo!');
        }
        finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    };

    @action updateProfile = async (profile: Partial<IProfile>) => {
        try {
            await agent.Profiles.updateProfile(profile);
            runInAction(() => {
                if (profile.displayName !== this.rootStore.userStore.user!.displayName) {
                    this.rootStore.userStore.user!.displayName = profile.displayName!;
                }
                this.profile = {...this.profile!, ...profile}
            })
        } catch (error) {
            console.log(error)
            toast.error('Problem updating profile!');
        }
    };
};