import styled from "@emotion/styled";
import type { ComponentType } from "react";
import { FiBookOpen, FiHome, FiMusic, FiUser } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

type Menu = {
  id: "dashboard" | "vocab" | "track" | "profile";
  label: string;
  icon: ComponentType<{ size?: number }>;
  path: string;
};

const menus: Menu[] = [
  { id: "dashboard", label: "대시보드", icon: FiHome, path: "/dashboard" },
  { id: "vocab", label: "단어장", icon: FiBookOpen, path: "/words" },
  { id: "track", label: "트랙", icon: FiMusic, path: "/tracks" },
  { id: "profile", label: "프로필", icon: FiUser, path: "/mypage" },
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (id: Menu["id"]) => {
    if (id === "track") return pathname.startsWith("/tracks");
    if (id === "vocab") return pathname.startsWith("/words");
    if (id === "dashboard") return pathname.startsWith("/dashboard");
    return pathname.startsWith("/mypage") || pathname.startsWith("/profile");
  };

  return (
    <Wrap>
      {menus.map((menu) => {
        const Icon = menu.icon;
        return (
          <Item
            key={menu.id}
            active={isActive(menu.id)}
            onClick={() => navigate(menu.path)}
            type="button"
          >
            <Icon size={20} />
            <span>{menu.label}</span>
          </Item>
        );
      })}
    </Wrap>
  );
}

const Wrap = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 72px;
  background: ${({ theme }) => theme.color.surface};
  border-top: 1px solid ${({ theme }) => theme.color.line};
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  z-index: 20;
`;

const Item = styled.button<{ active?: boolean }>`
  border: 0;
  background: transparent;
  color: ${({ theme, active }) => (active ? theme.color.blue : "#98a2b5")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: ${({ active }) => (active ? 700 : 600)};
  cursor: pointer;
`;