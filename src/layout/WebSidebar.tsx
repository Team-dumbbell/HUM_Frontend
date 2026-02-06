import styled from "@emotion/styled";
import type { ComponentType } from "react";
import { FaItunesNote } from "react-icons/fa";
import { FiBookOpen, FiHome, FiMusic, FiUser } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type Menu = {
  id: "dashboard" | "vocab" | "track";
  label: string;
  icon: ComponentType<{ size?: number }>;
  path: string;
};

const menus: Menu[] = [
  { id: "dashboard", label: "대시보드", icon: FiHome, path: "/dashboard" },
  { id: "vocab", label: "단어장", icon: FiBookOpen, path: "/words" },
  { id: "track", label: "트랙 로그", icon: FiMusic, path: "/tracks" },
];

export default function WebSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const isActive = (id: Menu["id"]) => {
    if (id === "track") return pathname.startsWith("/tracks");
    if (id === "vocab") return pathname.startsWith("/words");
    return pathname.startsWith("/dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Wrap>
      <Header>
        <Logo>
          <FaItunesNote />
        </Logo>
        <Brand>HUM</Brand>
      </Header>

      <Nav>
        {menus.map((menu) => {
          const Icon = menu.icon;
          return (
            <NavItem
              key={menu.id}
              active={isActive(menu.id)}
              onClick={() => navigate(menu.path)}
              type="button"
            >
              <Icon size={20} />
              <span>{menu.label}</span>
            </NavItem>
          );
        })}
      </Nav>

      <Footer>
        <FooterItem onClick={() => navigate("/mypage")} type="button">
          <FiUser size={18} />
          <span>마이페이지</span>
        </FooterItem>
        <Logout type="button" onClick={handleLogout}>
          로그아웃
        </Logout>
      </Footer>
    </Wrap>
  );
}

const Wrap = styled.aside`
  background: ${({ theme }) => theme.color.surface};
  border-right: 1px solid ${({ theme }) => theme.color.line};
  padding: 24px 18px 20px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 34px;
`;

const Logo = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: linear-gradient(145deg, #18b67a, #008f5a);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 16px;
  font-weight: 700;
`;

const Brand = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: #0d172f;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NavItem = styled.button<{ active?: boolean }>`
  height: 48px;
  border: 0;
  border-radius: 12px;
  background: ${({ active }) => (active ? "#e8fff5" : "transparent")};
  color: ${({ theme, active }) => (active ? theme.color.blue : "#647089")};
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
`;

const Footer = styled.div`
  margin-top: auto;
  color: #66748f;
`;

const FooterItem = styled.button`
  border: 0;
  background: transparent;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 42px;
  padding: 0 14px;
  color: inherit;
  cursor: pointer;
  text-align: left;
`;

const Logout = styled.button`
  border: 0;
  background: transparent;
  color: #8a97b0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 14px;
`;
