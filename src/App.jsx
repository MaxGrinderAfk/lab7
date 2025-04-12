import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import GroupPage from "./pages/GroupPage";
import StudentPage from "./pages/StudentPage";
import SubjectPage from "./pages/SubjectPage";
import MarkPage from "./pages/MarkPage";
import StudentSubjectsPage from "./pages/StudentSubjectsPage";
import {
    Group as GroupIcon,
    School as StudentIcon,
    Book as SubjectIcon,
    Assessment as MarkIcon,
    Dashboard as DashboardIcon,
    Menu as MenuIcon,
    Close as CloseIcon
} from "@mui/icons-material";
import styled from "@emotion/styled";

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
`;

const Sidebar = styled.aside`
  width: 240px;
  background: #1a237e;
  color: white;
  padding: 1.5rem 0;
  height: 100vh;
  position: fixed;
  left: ${props => props.isOpen ? '0' : '-240px'};
  top: 0;
  z-index: 1000;
  transition: left 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 1024px) {
    left: 0;
  }
`;

const Logo = styled.div`
  padding: 0 1.5rem 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const NavMenu = styled.nav`
  display: flex;
  flex-direction: column;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border-left: 4px solid ${props => props.active ? '#4fc3f7' : 'transparent'};
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: ${props => props.active ? 'bold' : 'normal'};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const Content = styled.main`
  flex: 1;
  padding: 2rem;
  margin-left: 0;
  transition: margin-left 0.3s ease;
  
  @media (min-width: 1024px) {
    margin-left: 240px;
  }
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
  margin-left: 0;
  transition: margin-left 0.3s ease;
  
  @media (min-width: 1024px) {
    margin-left: 240px;
  }
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: #1a237e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

const PageTitle = styled.h1`
  margin: 0 0 0 1rem;
  font-size: 1.25rem;
  color: #1a237e;
`;

const MobileOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.isOpen ? 'block' : 'none'};
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

function NavigationItem({ to, icon, label }) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <NavItem to={to} active={isActive ? 1 : 0}>
            {icon}
            {label}
        </NavItem>
    );
}

function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    useEffect(() => {
        closeSidebar();
    }, [location]);

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/groups':
                return 'Управление группами';
            case '/students':
                return 'Студенты';
            case '/subjects':
                return 'Предметы';
            case '/marks':
                return 'Оценки';
            case '/student-subjects':
                return 'Предметы студентов';
            default:
                return 'Система учёта';
        }
    };

    return (
        <AppContainer>
            <Sidebar isOpen={isSidebarOpen}>
                <Logo>
                    <DashboardIcon />
                    Система учёта
                </Logo>
                <NavMenu>
                    <NavigationItem to="/groups" icon={<GroupIcon />} label="Группы" />
                    <NavigationItem to="/students" icon={<StudentIcon />} label="Студенты" />
                    <NavigationItem to="/subjects" icon={<SubjectIcon />} label="Предметы" />
                    <NavigationItem to="/marks" icon={<MarkIcon />} label="Оценки" />
                    <NavigationItem to="/student-subjects" icon={<DashboardIcon />} label="Студент-Предмет" />
                </NavMenu>
            </Sidebar>

            <MobileOverlay isOpen={isSidebarOpen} onClick={closeSidebar} />

            <TopBar>
                <MenuButton onClick={toggleSidebar}>
                    {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
                </MenuButton>
                <PageTitle>{getPageTitle()}</PageTitle>
            </TopBar>

            <Content>
                <Routes>
                    <Route path="/groups" element={<GroupPage />} />
                    <Route path="/students" element={<StudentPage />} />
                    <Route path="/subjects" element={<SubjectPage />} />
                    <Route path="/marks" element={<MarkPage />} />
                    <Route path="/student-subjects" element={<StudentSubjectsPage />} />
                    <Route path="*" element={<div>Выберите раздел из меню слева</div>} />
                </Routes>
            </Content>
        </AppContainer>
    );
}

export default function App() {
    return (
        <Router>
            <MainLayout />
        </Router>
    );
}