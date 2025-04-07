// src/pages/AboutPage.js
import { useLoading } from '../contexts/LoadingContext';
import { fetchData } from '../services/apiServices';
import { useEffect } from 'react';
import withLoading from '../components/withLoading';

function Contact() {
  const { setIsLoading } = useLoading();

  useEffect(() => {
    setIsLoading(true);
    fetchData().then(() => setIsLoading(false));
  }, [setIsLoading]);

  return <h1>About Page</h1>;
}

export default withLoading(Contact);