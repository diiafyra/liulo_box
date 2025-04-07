import { motion } from 'framer-motion';
import HeroSection from '../../components/HeroSection/HeroSection';
import CommitmentSection from '../../components/CommitmentSection/CommitmentSection';
import PriceSection from '../../components/PriceSection/PriceSection';
import ServiceTabs from '../../components/ServiceTabs/ServiceTabs';
import './Home.css';

function Home() {
    return (
        <motion.div className="home">
            <HeroSection />
            <CommitmentSection />
            <PriceSection />
            <ServiceTabs />
        </motion.div>
    );
}

export default Home;