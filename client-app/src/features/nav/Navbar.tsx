import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react'
import { Link, NavLink } from 'react-router-dom';
import { Button, Container, Dropdown, Image, Menu } from 'semantic-ui-react'
import { RootStoreContext } from '../../app/stores/rootStore';

const Navbar: React.FC = () => {
    const rootStore = useContext(RootStoreContext);
    const {user, logout} = rootStore.userStore;
    return (
        <Menu fixed='top' inverted>
            <Container>
                <Menu.Item header as={NavLink} exact to='/'>
                    <img src="/assets/logo.png" alt="logo" style={{ marginRight: '10px' }} />
                    Reactivities
                </Menu.Item>
                <Menu.Item name='Activites' as={NavLink} to='/activities' />
                <Menu.Item>
                    <Button
                        as={NavLink} to='/createActivity'
                        positive
                        content='Create activity'
                    />
                </Menu.Item>
                {user &&
                    <Menu.Item position='right'>
                        <Image avatar spaced='right' src={user.image || '/assets/user.png'} />
                        <Dropdown pointing='top left' text={user.displayName}>
                            <Dropdown.Menu>
                                <Dropdown.Item 
                                as={Link} 
                                to={`/profile/${user.userName}`} 
                                text='My profile' 
                                icon='user' />
                                <Dropdown.Item onClick={logout} text='Logout' icon='power' />
                            </Dropdown.Menu>
                        </Dropdown>
                    </Menu.Item>
                }
            </Container>
        </Menu>
    );
};

export default observer(Navbar);