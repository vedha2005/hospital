import React, { Component } from 'react';
import classnames from 'classnames';
import './Navber.css';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';

import { Link } from 'react-router-dom';


class Navber extends Component {

    constructor(props) {

        super(props);

        this.state = {

            prevScrollpos: window.pageYOffset,

            visible: true

        };

    }


    componentDidMount() {

        window.addEventListener(
            "scroll",
            this.handleScroll
        );

    }


    componentWillUnmount() {

        window.removeEventListener(
            "scroll",
            this.handleScroll
        );

    }


    handleScroll = () => {

        const {
            prevScrollpos
        } = this.state;


        const currentScrollPos =
            window.pageYOffset;


        const visible =
            prevScrollpos > currentScrollPos;


        this.setState({

            prevScrollpos:
                currentScrollPos,

            visible:
                visible

        });

    };


    render() {

        return (

            <div>

                <Navbar
                    className={classnames(
                        "navbar",
                        {
                            "navbar--hidden":
                                !this.state.visible
                        }
                    )}
                    bg="primary"
                    variant="dark"
                    expand="lg"
                >


                    <Navbar.Brand
                        as={Link}
                        to="/"
                        style={{
                            color: "white"
                        }}
                    >

                        Lifescape Hospital Ltd

                    </Navbar.Brand>


                    <Navbar.Toggle
                        aria-controls="basic-navbar-nav"
                    />


                    <Navbar.Collapse
                        id="basic-navbar-nav"
                    >

                        <Nav className="ml-auto">


                            <Nav.Link
                                as={Link}
                                to="/"
                                className="text-white"
                            >

                                Home

                            </Nav.Link>


                            <Nav.Link
                                as={Link}
                                to="/about"
                                className="text-white"
                            >

                                About

                            </Nav.Link>


                            <Nav.Link
                                as={Link}
                                to="/gallery"
                                className="text-white"
                            >

                                Gallery

                            </Nav.Link>


                            <Nav.Link
                                as={Link}
                                to="/contact"
                                className="text-white"
                            >

                                Contact Us

                            </Nav.Link>


                            <Nav.Link
                                as={Link}
                                to="/regPatient"
                                className="text-white"
                            >

                                Patient Register

                            </Nav.Link>


                            <Nav.Link
                                as={Link}
                                to="/"
                                className="text-white"
                                onClick={() => {

                                    setTimeout(() => {

                                        const chatbot =
                                            document.querySelector(
                                                '.appointment-chatbot-container'
                                            );

                                        if (chatbot) {

                                            chatbot.scrollIntoView({
                                                behavior: 'smooth'
                                            });

                                        }

                                    }, 300);

                                }}
                            >

                                📅 Appointments

                            </Nav.Link>


                            <NavDropdown
                                title="Login"
                                id="basic-nav-dropdown"
                                className="mr-5"
                            >

                                <NavDropdown.Item
                                    as={Link}
                                    to="/patient/login"
                                >

                                    Patient Login

                                </NavDropdown.Item>


                                <NavDropdown.Item
                                    as={Link}
                                    to="/doctors/login"
                                >

                                    Doctor Login

                                </NavDropdown.Item>


                                <NavDropdown.Item
                                    as={Link}
                                    to="/employee/login"
                                >

                                    Employee Login

                                </NavDropdown.Item>


                                <NavDropdown.Item
                                    as={Link}
                                    to="/administrator/login"
                                >

                                    Admin Login

                                </NavDropdown.Item>

                            </NavDropdown>


                        </Nav>

                    </Navbar.Collapse>

                </Navbar>

            </div>

        );

    }

}


export default Navber;