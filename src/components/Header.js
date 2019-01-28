import React from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
} from 'reactstrap';
import { FaWikipediaW } from 'react-icons/fa';

export default class Header extends React.Component {

    render() {
        return (
            <div id="header" className="header">
                <Navbar className="custom-navbar" expand="md">
                    <NavbarBrand href="" style={{ fontSize: 32, fontWeight: 800 }}>
                        BlindPedia <FaWikipediaW />
                    </NavbarBrand>
                    <NavbarToggler/>
                    <Collapse isOpen={true} navbar>
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <NavLink
                                    className="button-nav-link"
                                    onClick={this.props.changeLang}>
                                    {`${this.props.lang === 'es'? 'English' : 'Spanish'}`}
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        )
    }

}

Header.defaultProps = {
    lang: 'es'
}