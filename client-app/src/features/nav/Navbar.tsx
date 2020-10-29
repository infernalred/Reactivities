import React from 'react'
import { Button, Container, Menu } from 'semantic-ui-react'

interface IProps {
    openCreateForm: () => void;
}

const Navbar: React.FC<IProps> = ({openCreateForm}) => {
    return (
        <Menu fixed='top' inverted>
            <Container>
                <Menu.Item header>
                    <img src="/assets/logo.png" alt="logo" style={{marginRight: '10px'}}/>
                    Reactivities
                </Menu.Item>
                <Menu.Item name='Activites' />
                <Menu.Item>
                    <Button onClick={openCreateForm} positive content='Create activity' />
                </Menu.Item>
            </Container>
        </Menu>
    );
};

export default Navbar;