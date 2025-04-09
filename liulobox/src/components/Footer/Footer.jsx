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

                    <motion.div className="footer-section map-section"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29803.94176895018!2d105.76359993802114!3d20.972877335148272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad0008bcb81f%3A0xc6ad21c94720b137!2zSG9tZSBCb3ggU3R1ZGlvIEjDoCDEkMO0bmc!5e0!3m2!1svi!2s!4v1744185452148!5m2!1svi!2s"
                            width="100%"
                            height="250"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
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
