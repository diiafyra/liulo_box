import { useLoading } from '../contexts/LoadingContext';
import LoadingEqualizer from './LoadingRipple';
import { motion, AnimatePresence } from 'framer-motion';

function withLoading(WrappedComponent) {
  return function WithLoadingComponent(props) {
    const { isLoading } = useLoading();

    return (
      <>
        <WrappedComponent {...props} />
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0 } }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
              }}
            >
              <LoadingEqualizer />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };
}

export default withLoading;