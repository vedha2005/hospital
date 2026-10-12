import React, { Component } from 'react';

import Homeimage from "../Homeimage";
import Navber from '../Navber/Navber';
import './Home.css';

import OurDoctors from '../OurDoctors';
import Footer from '../Footer';
import HomeQuote from '../HomeQuote';
import Mission from '../Mission';

import AppointmentChatbot from '../AppointmentChatbot/AppointmentChatbot';


class Home extends Component {

    render() {

        return (

            <div className="bg-dark">

                <Navber />


                <Homeimage />


                <Mission />


                <br />
                <br />


                <h1
                    className="head text-white"
                    align="center"
                >
                    Our Doctors
                </h1>


                <br />
                <br />


                <OurDoctors />


                <br />
                <br />


                <h1
                    className="text-white"
                    align="center"
                >
                    News and Achievements
                </h1>


                <br />
                <br />


                <HomeQuote />


                <br />
                <br />


                {/* =================================================
                    PUBLIC APPOINTMENT CHATBOT
                ================================================= */}

                <AppointmentChatbot />


                <br />
                <br />


                <Footer />

            </div>

        );

    }

}


export default Home;