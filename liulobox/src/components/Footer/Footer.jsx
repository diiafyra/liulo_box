import React from "react";
import { motion } from "framer-motion";
import { IonIcon } from "@ionic/react";
import { arrowUp, call, mailSharp, map } from "ionicons/icons";
import "./Footer.css"

const Footer = () => {
    return (
        <motion.footer
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="footer"
        >
            <div className="container">
                <div className="back-to-top">
                    <a href="#" className="top-button">
                        <IonIcon icon={arrowUp} />
                    </a>
                </div>

                
                <div className="footer-content">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="footer-section"
                    >
                        <h2>Liu Lo Music Box</h2>
                        <p>So you think you can sing. You trust yourself — but I don’t. :) </p>
                        <div className="social-icons">
                            <a href="#"><span className="icon-twitter"></span></a>
                            <a href="#"><span className="icon-facebook"></span></a>
                            <a href="#"><span className="icon-instagram"></span></a>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="footer-section"
                    >
                        <h2>Help</h2>
                        <ul>
                            <li><a href="#">Shipping Information</a></li>
                            <li><a href="#">Returns & Exchange</a></li>
                            <li><a href="#">Terms & Conditions</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="footer-section"
                    >
                        <h2>Have a Question?</h2>
                        <p><IonIcon icon={map} /> Trăm Năm Hạnh Phúc, Hà Đông, Hà Nội</p>
                        <p><IonIcon icon={call} /> <a href="tel:+84852885411">+84 852 885 411</a></p>
                        <p><IonIcon icon={mailSharp} /> <a href="mailto:tro0852885411@gmail.com">tro0852885411@gmail.com</a></p>
                    </motion.div>



                </div>

                <div className="footer-bottom">
                    <p>Copyright &copy; {new Date().getFullYear()} All rights reserved</p>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer;
