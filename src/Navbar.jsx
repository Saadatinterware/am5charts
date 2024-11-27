import React, { useState } from "react";
import './Navbar.scss';

const Navbar = () => {
  const [isProfileActive, setProfileActive] = useState(false);
  const [isNotificationsActive, setNotificationsActive] = useState(false);
  const [isPopupVisible, setPopupVisible] = useState(false);

  const toggleProfile = () => {
    setProfileActive(!isProfileActive);
    setNotificationsActive(false);
  };

  const toggleNotifications = () => {
    setNotificationsActive(!isNotificationsActive);
    setProfileActive(false);
  };

  const showPopup = () => {
    setNotificationsActive(false);
    setPopupVisible(true);
  };

  const hidePopup = () => {
    setPopupVisible(false);
  };

  return (
    <div className="wrapper">
      <div className="navbar">
        <div className="navbar_left">
          <div className="logo">
            <a href="#">Coding Market</a>
          </div>
        </div>

        <div className="navbar_right">
          <div className="notifications">
            <div className="icon_wrap" onClick={toggleNotifications}>
              <i className="far fa-bell"></i>
            </div>

            <div className={`notification_dd ${isNotificationsActive ? "active" : ""}`}>
              <ul className="notification_ul">
                <NotificationItem type="success" brand="starbucks" status="Success" />
                <NotificationItem type="failed" brand="baskin_robbins" status="Failed" />
                <NotificationItem type="success" brand="mcd" status="Success" />
                <NotificationItem type="failed" brand="pizzahut" status="Failed" />
                <NotificationItem type="success" brand="kfc" status="Success" />
                <li className="show_all">
                  <p className="link" onClick={showPopup}>Show All Activities</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="profile">
            <div className="icon_wrap" onClick={toggleProfile}>
              <img src="https://i.imgur.com/x3omKbe.png" alt="profile_pic" />
              <span className="name">John Alex</span>
              <i className="fas fa-chevron-down"></i>
            </div>

            <div className={`profile_dd ${isProfileActive ? "active" : ""}`}>
              <ul className="profile_ul">
                <li className="profile_li">
                  <a className="profile" href="#"><span className="picon"><i className="fas fa-user-alt"></i></span>Profile</a>
                  <div className="btn">My Account</div>
                </li>
                <li><a className="address" href="#"><span className="picon"><i className="fas fa-map-marker"></i></span>Address</a></li>
                <li><a className="settings" href="#"><span className="picon"><i className="fas fa-cog"></i></span>Settings</a></li>
                <li><a className="logout" href="#"><span className="picon"><i className="fas fa-sign-out-alt"></i></span>Logout</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Notification */}
      {isPopupVisible && (
        <div className="popup">
          <div className="shadow" onClick={hidePopup}></div>
          <div className="inner_popup">
            <div className="notification_dd">
              <ul className="notification_ul">
                <li className="title">
                  <p>All Notifications</p>
                  <p className="close" onClick={hidePopup}><i className="fas fa-times" aria-hidden="true"></i></p>
                </li>
                <NotificationItem type="success" brand="starbucks" status="Success" />
                <NotificationItem type="failed" brand="baskin_robbins" status="Failed" />
                <NotificationItem type="success" brand="mcd" status="Success" />
                <NotificationItem type="failed" brand="pizzahut" status="Failed" />
                <NotificationItem type="success" brand="kfc" status="Success" />
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationItem = ({ type, brand, status }) => {
  return (
    <li className={`${brand} ${type}`}>
      <div className="notify_icon">
        <span className="icon"></span>
      </div>
      <div className="notify_data">
        <div className="title">Lorem, ipsum dolor.</div>
        <div className="sub_title">Lorem ipsum dolor sit amet consectetur.</div>
      </div>
      <div className="notify_status">
        <p>{status}</p>
      </div>
    </li>
  );
};

export default Navbar;
