import React, { useContext, useEffect, useState } from 'react';
import { Badge, Button, Container, Dropdown, Image, Nav, Navbar } from 'react-bootstrap';
import { FaBell, FaCaretDown, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/logo.png';
import NotificationIcon from "../../assets/images/notifications.svg";
import { AuthenticationContext } from '../../contexts/authentication.context';
import './header.scss';
import { handleGetNotifications, handleMarkNotificationById, handleMarkAllNotifications, handleDeleteNotification, handleDeleteAllNotification, handleCountNotifications } from '../../services/notification.service';

export default function Header({ isActiveSidebar, toggleSidebarButton }) {
    const { logout } = useContext(AuthenticationContext);

    const [notifications, setNotifications] = useState([]);
    const imageUrl = JSON.parse(localStorage.getItem("imageUrl"));
    const firstName = JSON.parse(localStorage.getItem("firstName"));
    const lastName = JSON.parse(localStorage.getItem("lastName"));
    const companyTitle = JSON.parse(localStorage.getItem("companyTitle"));
    const [notificationsCount, setNotificationsCount] = useState({
        count: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            fetchNotificationCount();
            const response = await handleGetNotifications();
            if (response.status === 200) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const fetchNotificationCount = async()=>{
        try{
            const response = await handleCountNotifications();
            if (response.status === 200) {
                setNotificationsCount({
                    count : response.data.data.count
                });
            }
        }catch(error){
            console.error("Failed to fetch notifications count", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await handleMarkAllNotifications();
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark all notifications as read", error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            console.log("Delete called...",id);
            await handleDeleteNotification(id);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    return (
        <Navbar bg='white' data-bs-theme='light' variant='light' className="py-0 px-md-1 shadow-sm z-2 theme-top-header">
            <Container fluid className="h-100">
                <Button onClick={toggleSidebarButton} variant="link" className="align-items-center d-flex d-xl-none justify-content-center me-3 navMenuBtn p-0 py-3">
                    <span className={`bg-info d-inline-block menuTrigger position-relative text-center ${isActiveSidebar ? 'active' : ''}`}></span>
                </Button>
                <Link to="/dashboard" className="me-3">
                    <Image
                        // className="img-fluid"
                        src={Logo}
                        alt={`Logo`}
                        width={220}
                        height={'auto'}
                    />
                </Link>
                <Nav className="ms-auto align-items-center order-md-last ">
                    <Button variant="link" className="text-body position-relative py-0 mt-1 mx-2 px-2">
                        <Dropdown>
                            <Dropdown.Toggle variant="" id="dropdown-basic">
                                <Image className="" src={NotificationIcon} alt={`Notification Icon`} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className='notification-modal min-height'>
                                <div className='fs-14 fw-bolder text-center px-3'>
                                    { notificationsCount.count>0 ? <a href='#' onClick={markAllAsRead} className='text-decoration-none'>Mark As Read</a> 
                                    : 'No notification found' }
                                </div>
                                 {notifications.map(notification => (
                                    <Dropdown.Item key={notification.id} href="#/action-1">
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <div>
                                                <div className='fs-14 fw-bolder'>{notification.title}</div>
                                                <p className='fs-14 mb-0'>{notification.message}</p>
                                            </div>
                                            
                                            <div>
                                                <FaTrash className='text-primary ms-2 ' onClick={() => deleteNotification(notification.id)} />
                                            </div>
                                        </div>
                                    </Dropdown.Item>
                                ))}


                                
                                    
                                        {/* <div className='d-flex justify-content-between align-items-center'>
                                             <div>
                                                <div className='fs-14 fw-bolder'>{notification.title}</div>
                                                <p className='fs-14 mb-0'>{notification.message}</p>
                                            </div> 
                                            <div>
                                                <div className='fs-14 fw-bolder'>dslkfdsjlksfldjfjdflkjlkjdslkfdsjlksfldjfjdflkjlkjdslkfdsjlksfldjfjdflkjlkjdslkfdsjlksfldjfjdflkjlkj</div>
                                                <p className='fs-14 mb-0'>;'sdf;';lklkv;lkv;'vc;v;cx'lv</p>
                                            </div>

                                            
                                            <div>
                                                <FaTrash className='text-primary' onClick={() => deleteNotification(1)} />
                                            </div>
                                        </div> */}
                                    
                               
                            </Dropdown.Menu>
                        </Dropdown>
                        <Badge bg="dark" className="border border-white fw-semibold position-absolute rounded-pill notification-count translate-middle ms-n1">
                            {notificationsCount.count}
                            <span className="visually-hidden">Notification</span>
                        </Badge>
                    </Button>
                    <Dropdown className="profileDropdown ms-4">
                        <Dropdown.Toggle variant="link" id="dropdown-profile" className="border-0 fw-semibold text-decoration-none p-0 text-body">
                            <Image className="object-fit-cover rounded-circle" src={imageUrl != null ? imageUrl : "https://dummyimage.com/40"} width={40} height={40} />
                            <span className="align-middle text-start d-none d-md-inline-block ms-1 px-2 text-truncate custom-max-width-150">
                                <span className='w-100 user-name'>{firstName}</span>
                                <span className='compnany-name'>{companyTitle}</span>
                            </span>
                            <FaCaretDown size={16} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end" className="shadow-sm">
                            <Dropdown.Item onClick={logout} className="fw-medium gap-2 d-flex align-items-center">
                                Logout
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Nav>
            </Container>
        </Navbar>
    );
}
