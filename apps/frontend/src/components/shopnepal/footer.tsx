// @ts-nocheck
export function Footer(){
  return (
    <footer>
      <div className="footer-category"><div className="container"><h2 className="footer-category-title">Brand directory</h2></div></div>
      <div className="footer-nav"><div className="container">
        <ul className="footer-nav-list">
          <li className="footer-nav-item"><h2 className="nav-title">Contact</h2></li>
          <li className="footer-nav-item flex"><div className="icon-box"><ion-icon name="location-outline"></ion-icon></div><address className="content">Pulchowk, Lalitpur<br/>Bagmati Province 44700, Nepal</address></li>
          <li className="footer-nav-item flex"><div className="icon-box"><ion-icon name="call-outline"></ion-icon></div><a href="tel:+9779800000000" className="footer-nav-link">+977 9800000000</a></li>
          <li className="footer-nav-item flex"><div className="icon-box"><ion-icon name="mail-outline"></ion-icon></div><a href="mailto:support@shopnepal.com.np" className="footer-nav-link">support@shopnepal.com.np</a></li>
        </ul>
      </div></div>
      <div className="footer-bottom"><div className="container"><img src="/assets/images/payment.png" alt="payment" className="payment-img"/><p className="copyright">Copyright &copy; <a href="/">ShopNepal</a> all rights reserved.</p></div></div>
    </footer>
  );
}
