import Header from '../components/Header'; // Sử dụng Header đã viết
import Footer from '../components/Footer/Footer';
// import './MainLayout.css';

function MainLayout({ children, isLoggedIn = true }) {
  return (
    <div className="layout">
      <Header isLoggedIn={isLoggedIn} />
      <main className="content">{children}</main>
      <Footer/>
    </div>
  );
}

export default MainLayout;