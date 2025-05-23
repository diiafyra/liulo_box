import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tabs from "@radix-ui/react-tabs";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import "./ServiceTabs.css";

const tabContentVariants = {
  hidden: (direction) => ({
    opacity: 0,
    x: direction === "right" ? 50 : -50,
    scale: 0.98,
  }),
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction === "right" ? -50 : 50,
    scale: 0.98,
    transition: { duration: 0.2, ease: "easeIn" },
  }),
};

function ServiceTabs({ showQuantityControls = false, quantities = {}, onQuantitiesChange }) {
  const [activeTab, setActiveTab] = useState("food");
  const [direction, setDirection] = useState("right");
  const [tabData, setTabData] = useState([
    { key: "food", label: "Food", items: [] },
    { key: "drink", label: "Drinks", items: [] },
  ]);
  const [localQuantities, setLocalQuantities] = useState({});
  const navigate = useNavigate();
  const [sectionRef, sectionInView] = useInView({ triggerOnce: false, threshold: 0.2 });

  useEffect(() => {
    // So sánh cũ và mới để tránh setState không cần thiết
    const isEqual = JSON.stringify(localQuantities) === JSON.stringify(quantities);
    if (!isEqual) {
      setLocalQuantities(quantities);
    }
  }, [quantities]);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodRes, drinkRes] = await Promise.all([
          fetch("https://fbb1-171-224-84-105.ngrok-free.app/api/fooddrink/Food", {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          }),
          fetch("https://fbb1-171-224-84-105.ngrok-free.app/api/fooddrink/Drink", {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          })
        ]);

        const foodData = await foodRes.json();
        const drinkData = await drinkRes.json();

        setTabData([
          {
            key: "food",
            label: "Food",
            items: foodData.map((item) => ({
              id: item.id,
              name: item.name,
              price: `${item.price / 1000}K`,
              rawPrice: item.price,
              stock: item.stock || 10,
            })),
          },
          {
            key: "drink",
            label: "Drinks",
            items: drinkData.map((item) => ({
              id: item.id,
              name: item.name,
              price: `${item.price / 1000}K`,
              rawPrice: item.price,
              stock: item.stock || 10,
            })),
          },
        ]);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchData();
  }, []);

  const handleQuantityChange = (itemId, change, maxStock, rawPrice) => {
    const currentQty = localQuantities[itemId]?.quantity || 0;
    const newQty = Math.min(Math.max(0, currentQty + change), maxStock);

    const updatedQuantities = {
      ...localQuantities,
      [itemId]: { quantity: newQty, rawPrice },
    };

    setLocalQuantities(updatedQuantities);

    const serviceTotal = Object.values(updatedQuantities).reduce(
      (sum, item) => sum + item.quantity * item.rawPrice,
      0
    );

    if (onQuantitiesChange) {
      onQuantitiesChange(updatedQuantities, serviceTotal);
    }
  };

  const handleTabChange = (newTab) => {
    const currentIndex = tabData.findIndex((tab) => tab.key === activeTab);
    const newIndex = tabData.findIndex((tab) => tab.key === newTab);
    setDirection(newIndex > currentIndex ? "right" : "left");
    setActiveTab(newTab);
  };

  const calculateTotal = () => {
    return Object.values(localQuantities).reduce(
      (sum, item) => sum + item.quantity * item.rawPrice,
      0
    );
  };

  return (
    <motion.section
      ref={sectionRef}
      className="service-tabs-section"
      initial={{ opacity: 0, y: 50 }}
      animate={sectionInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Tabs.Root className="service-tabs" value={activeTab} onValueChange={handleTabChange}>
        <motion.h2
          className="service-title"
          initial={{ y: 20, opacity: 0 }}
          animate={sectionInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Dịch vụ khác
        </motion.h2>

        <Tabs.List className="tab-buttons">
          {tabData.map(({ key, label }, index) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={sectionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Tabs.Trigger
                value={key}
                className={`tab-button ${activeTab === key ? "active" : ""}`}
              >
                {label}
              </Tabs.Trigger>
            </motion.div>
          ))}
        </Tabs.List>

        <AnimatePresence mode="wait" custom={direction}>
          {tabData.map(({ key, items }) =>
            activeTab === key ? (
              <motion.div
                key={key}
                custom={direction}
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Tabs.Content value={key} className="tab-content">
                  <div className="service-items">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="service-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={sectionInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <div className="item-info">
                          <span
                            onClick={() => navigate(`/fooddrink/${item.id}`)}
                            className="item-name"
                          >
                            {item.name}
                          </span>
                          <span className="item-price">{item.price}</span>
                        </div>
                        {showQuantityControls && (
                          <div className="quantity-wrapper">
                            <div className="quantity-controls">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, -1, item.stock, item.rawPrice)
                                }
                              >
                                –
                              </button>
                              <span>{localQuantities[item.id]?.quantity || 0}</span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, 1, item.stock, item.rawPrice)
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </Tabs.Content>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </Tabs.Root>

      {showQuantityControls && (
        <motion.div
          className="total-bill"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Tổng tiền: <span>{(calculateTotal() / 1000)}K</span>
        </motion.div>
      )}
    </motion.section>
  );
}

export default ServiceTabs;
