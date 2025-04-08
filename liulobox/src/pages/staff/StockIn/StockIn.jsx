import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import './StockIn.css';

const StockIn = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [stockChanges, setStockChanges] = useState({});
  const [newProductForm, setNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Food', price: '', description: '', imageUrl: '' });

  useEffect(() => {
    fetch('http://localhost:5220/api/FoodDrink', {
      headers: {
        'Authorization': `Bearer ${user?.accessToken}`
      }
    })
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error('Lỗi khi load dữ liệu:', err));
  }, [user]);

  const handleChange = (id, value) => {
    const numValue = value === '' ? '' : Number(value); // Giữ chuỗi rỗng để UI hiển thị trống
    if (value !== '' && isNaN(numValue)) return; // Bỏ qua nếu không phải số
    setStockChanges(prev => ({
      ...prev,
      [id]: numValue
    }));
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitStockIn = () => {
    if (!user || !user.accessToken) {
      alert('Vui lòng đăng nhập để thực hiện nhập kho!');
      return;
    }

    const validEntries = Object.entries(stockChanges).filter(([_, val]) => {
      const numVal = Number(val);
      return !isNaN(numVal) && numVal > 0;
    });

    if (validEntries.length === 0) {
      alert('Vui lòng nhập số lượng hợp lệ cho ít nhất một sản phẩm!');
      return;
    }

    const stockRequest = {
      items: validEntries.map(([id, quantity]) => ({
        foodDrinkId: Number(id),
        quantity: Number(quantity)
      }))
    };

    console.log('Sending stock request:', stockRequest);

    fetch('http://localhost:5220/api/Stock/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.accessToken}`
      },
      body: JSON.stringify(stockRequest)
    })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => {
            throw new Error(text);
          });
        }
        return res.json();
      })
      .then(data => {
        setItems(prev =>
          prev.map(item => {
            const addedQuantity = Number(stockChanges[item.id]) || 0;
            return addedQuantity > 0 ? { ...item, stock: item.stock + addedQuantity } : item;
          })
        );
        setStockChanges({}); // Reset stockChanges
        alert(data.message || 'Nhập kho thành công!');
      })
      .catch(err => {
        console.error('Lỗi khi nhập kho:', err);
        alert('Có lỗi xảy ra khi nhập kho: ' + err.message);
      });
  };

  const handleAddNewProduct = () => {
    if (!user || !user.accessToken) {
      alert('Vui lòng đăng nhập để thêm sản phẩm!');
      return;
    }

    if (!newProduct.name || !newProduct.price) {
      alert('Vui lòng điền đầy đủ tên và giá!');
      return;
    }

    const newProductData = {
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      description: newProduct.description,
      imageUrl: newProduct.imageUrl
    };

    fetch('http://localhost:5220/api/FoodDrink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.accessToken}`
      },
      body: JSON.stringify(newProductData)
    })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => {
            throw new Error(text);
          });
        }
        return res.json();
      })
      .then(data => {
        setItems(prev => [...prev, data]);
        alert('Đã thêm sản phẩm mới!');
        setNewProduct({ name: '', category: 'Food', price: '', description: '', imageUrl: '' });
        setNewProductForm(false);
      })
      .catch(err => {
        console.error('Lỗi khi thêm sản phẩm mới:', err);
        alert('Có lỗi xảy ra khi thêm sản phẩm: ' + err.message);
      });
  };

  const renderGrid = (title, list) => (
    <div className="stock-section">
      <h2>{title}</h2>
      <div className="stock-grid">
        {list.map(item => (
          <div key={item.id} className="stock-card">
            <img src={item.imageUrl} alt={item.name} />
            <h3>{item.name}</h3>
            <p><strong>{item.category}</strong></p>
            <p>{item.description}</p>
            <p><strong>Giá:</strong> {item.price.toLocaleString()} VND</p>
            <p><strong>Tồn kho:</strong> {item.stock}</p>
            <input
              type="number"
              placeholder="Số lượng nhập thêm"
              min="0"
              value={stockChanges[item.id] !== undefined ? stockChanges[item.id] : ''} // Đảm bảo giá trị hiển thị đúng
              onChange={e => handleChange(item.id, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="stock-container">
      <div className="stock-actions">
        <button onClick={handleSubmitStockIn}>Hoàn thành nhập hàng</button>
        <button onClick={() => setNewProductForm(true)}>Thêm sản phẩm mới</button>
      </div>
      {renderGrid('Sản phẩm còn hàng', items.filter(i => i.stock > 0))}
      {renderGrid('Sản phẩm hết hàng', items.filter(i => i.stock === 0))}

      {newProductForm && (
        <div className="new-product-modal">
          <h2>Thêm Sản Phẩm Mới</h2>
          <input
            type="text"
            name="name"
            value={newProduct.name}
            onChange={handleNewProductChange}
            placeholder="Tên sản phẩm"
          />
          <select
            name="category"
            value={newProduct.category}
            onChange={handleNewProductChange}
          >
            <option value="Food">Food</option>
            <option value="Drink">Drink</option>
          </select>
          <input
            type="number"
            name="price"
            value={newProduct.price}
            onChange={handleNewProductChange}
            placeholder="Giá"
          />
          <input
            type="text"
            name="description"
            value={newProduct.description}
            onChange={handleNewProductChange}
            placeholder="Mô tả"
          />
          <input
            type="text"
            name="imageUrl"
            value={newProduct.imageUrl}
            onChange={handleNewProductChange}
            placeholder="URL ảnh"
          />
          <button onClick={handleAddNewProduct}>Thêm sản phẩm</button>
          <button onClick={() => setNewProductForm(false)}>Đóng</button>
        </div>
      )}
    </div>
  );
};

export default StockIn;