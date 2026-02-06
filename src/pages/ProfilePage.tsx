import { useEffect, type ComponentType } from "react";
import styled from "@emotion/styled";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiCamera,
  FiChevronRight,
  FiHelpCircle,
  FiMail,
  FiMessageCircle,
  FiShield,
  FiUser,
} from "react-icons/fi";
import MobileBottomNav from "../layout/MobileBottomNav";
import WebSidebar from "../layout/WebSidebar";
import { useAuth } from "../auth/AuthContext";
import { useMediaQuery } from "../shared/hooks/useMediaQueryl";
import { useWordStore } from "../store/useWordStore";

type SettingItem = {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  iconColor: string;
  iconBg: string;
};

type SettingSection = {
  id: string;
  title: string;
  items: SettingItem[];
};

const SETTING_SECTIONS: SettingSection[] = [
  {
    id: "account",
    title: "계정 및 보안",
    items: [
      {
        id: "email",
        label: "이메일 계정 관리",
        icon: FiMail,
        iconColor: "#2A6BFF",
        iconBg: "#EEF5FF",
      },
      {
        id: "security",
        label: "로그인 보안 설정",
        icon: FiShield,
        iconColor: "#7A32FF",
        iconBg: "#F6EEFF",
      },
    ],
  },
  {
    id: "app",
    title: "앱 설정",
    items: [
      {
        id: "push",
        label: "푸시 알림 설정",
        icon: FiBell,
        iconColor: "#FF5A00",
        iconBg: "#FFF4E8",
      },
      {
        id: "language",
        label: "학습 언어 설정",
        icon: FiUser,
        iconColor: "#0A9A55",
        iconBg: "#EAFFF3",
      },
    ],
  },
  {
    id: "support",
    title: "고객 지원",
    items: [
      {
        id: "faq",
        label: "자주 묻는 질문",
        icon: FiHelpCircle,
        iconColor: "#475569",
        iconBg: "#F2F4F7",
      },
      {
        id: "inquiry",
        label: "1:1 문의하기",
        icon: FiMessageCircle,
        iconColor: "#475569",
        iconBg: "#F2F4F7",
      },
    ],
  },
];

export default function ProfilePage() {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user, profile, fetchAppData } = useWordStore();

  useEffect(() => {
    fetchAppData();
  }, [fetchAppData]);

  const displayName = user.name.trim() || "HUM User";
  const displayEmail = profile.email.trim() || "등록된 이메일이 없습니다.";
  const avatarText = (user.avatarText.trim() || displayName.charAt(0) || "H").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (isMobile) {
    return (
      <MobileWrap>
        <MobileHeader>
          <PageTitle>프로필</PageTitle>
        </MobileHeader>

        <MobileBody>
          <ProfileCard>
            <ProfileMain>
              <AvatarWrap>
                <AvatarCircle>{avatarText}</AvatarCircle>
                <CameraBadge type="button" aria-label="프로필 이미지 변경">
                  <FiCamera size={14} />
                </CameraBadge>
              </AvatarWrap>

              <ProfileText>
                <UserName>{displayName}</UserName>
                <EmailRow>
                  <FaGoogle size={16} />
                  <span>{displayEmail}</span>
                </EmailRow>
                <ButtonRow>
                  <EditButton type="button">프로필 수정</EditButton>
                  <LogoutButton type="button" onClick={handleLogout}>
                    로그아웃
                  </LogoutButton>
                </ButtonRow>
              </ProfileText>
            </ProfileMain>
          </ProfileCard>

          <SettingSectionList />

          <FooterText>
            <span>HUM Learner v2.4.0</span>
            <FooterLinks>
              <button type="button">이용약관</button>
              <button type="button">개인정보처리방침</button>
            </FooterLinks>
          </FooterText>
        </MobileBody>

        <MobileBottomNav />
      </MobileWrap>
    );
  }

  return (
    <DesktopLayout>
      <WebSidebar />

      <DesktopMain>
        <DesktopHeader>
          <PageTitle>프로필</PageTitle>
        </DesktopHeader>

        <DesktopBody>
          <ProfileCard>
            <ProfileMain>
              <AvatarWrap>
                <AvatarCircle>{avatarText}</AvatarCircle>
                <CameraBadge type="button" aria-label="프로필 이미지 변경">
                  <FiCamera size={14} />
                </CameraBadge>
              </AvatarWrap>

              <ProfileText>
                <UserName>{displayName}</UserName>
                <EmailRow>
                  <FaGoogle size={16} />
                  <span>{displayEmail}</span>
                </EmailRow>
                <ButtonRow>
                  <EditButton type="button">프로필 수정</EditButton>
                  <LogoutButton type="button" onClick={handleLogout}>
                    로그아웃
                  </LogoutButton>
                </ButtonRow>
              </ProfileText>
            </ProfileMain>
          </ProfileCard>

          <SettingSectionList />

          <FooterText desktop>
            <span>HUM Learner v2.4.0</span>
            <FooterLinks>
              <button type="button">이용약관</button>
              <button type="button">개인정보처리방침</button>
            </FooterLinks>
          </FooterText>
        </DesktopBody>

        <HelpFab type="button" aria-label="도움말">
          ?
        </HelpFab>
      </DesktopMain>
    </DesktopLayout>
  );
}

function SettingSectionList() {
  return (
    <SectionList>
      {SETTING_SECTIONS.map((section) => (
        <Section key={section.id}>
          <SectionTitle>{section.title}</SectionTitle>
          <ItemList>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <SettingItemRow key={item.id} type="button">
                  <ItemLeft>
                    <ItemIcon bg={item.iconBg} color={item.iconColor}>
                      <Icon size={16} />
                    </ItemIcon>
                    <ItemLabel>{item.label}</ItemLabel>
                  </ItemLeft>
                  <FiChevronRight size={20} color="#CBD5E1" />
                </SettingItemRow>
              );
            })}
          </ItemList>
        </Section>
      ))}
    </SectionList>
  );
}

const DesktopLayout = styled.div`
  height: 100dvh;
  display: grid;
  grid-template-columns: 280px 1fr;
  overflow: hidden;
`;

const DesktopMain = styled.div`
  position: relative;
  background: ${({ theme }) => theme.color.surface};
  min-height: 0;
  display: grid;
  grid-template-rows: 74px minmax(0, 1fr);
`;

const DesktopHeader = styled.header`
  border-bottom: 1px solid #eef2f7;
  display: flex;
  align-items: center;
  padding: 0 28px;
`;

const PageTitle = styled.h1`
  margin: 0;
  color: #0f1d3d;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.02em;

  @media (max-width: 1023px) {
    font-size: 30px;
    line-height: 1.1;
    text-decoration: underline;
    text-underline-offset: 6px;
  }
`;

const DesktopBody = styled.main`
  padding: 22px 28px 30px;
  overflow-y: auto;
`;

const MobileWrap = styled.div`
  min-height: 100dvh;
  background: ${({ theme }) => theme.color.surface};
  padding-bottom: 92px;
`;

const MobileHeader = styled.header`
  height: 84px;
  padding: 0 20px;
  border-bottom: 1px solid #eef2f7;
  display: flex;
  align-items: center;
`;

const MobileBody = styled.main`
  padding: 16px 20px 26px;
`;

const ProfileCard = styled.section`
  border: 1px solid #edf1f7;
  border-radius: 20px;
  background: #fff;
  padding: 18px;
`;

const ProfileMain = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const AvatarWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const AvatarCircle = styled.div`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: linear-gradient(145deg, #5b6779, #252d3c);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 30px;
  font-weight: 800;
`;

const CameraBadge = styled.button`
  position: absolute;
  right: -4px;
  bottom: 6px;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: #00a36c;
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
`;

const ProfileText = styled.div`
  min-width: 0;
`;

const UserName = styled.h2`
  margin: 0;
  font-size: 32px;
  line-height: 1;
  color: #0f1d3d;
  letter-spacing: -0.02em;

  @media (max-width: 1023px) {
    font-size: 24px;
  }
`;

const EmailRow = styled.p`
  margin: 10px 0 0;
  color: #6b778d;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;

  @media (max-width: 1023px) {
    margin-top: 6px;
    font-size: 14px;
  }
`;

const ButtonRow = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 10px;
`;

const EditButton = styled.button`
  min-width: 116px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #dce4ef;
  background: #fff;
  color: #253552;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  @media (max-width: 1023px) {
    min-width: 100px;
    height: 38px;
    font-size: 14px;
  }
`;

const LogoutButton = styled(EditButton)`
  color: #ff2b2b;
`;

const SectionList = styled.div`
  margin-top: 24px;
`;

const Section = styled.section`
  margin-top: 28px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px;
  color: #a0abc0;
  font-size: 18px;
  font-weight: 800;

  @media (max-width: 1023px) {
    font-size: 16px;
  }
`;

const ItemList = styled.div`
  display: grid;
  gap: 8px;
`;

const SettingItemRow = styled.button`
  width: 100%;
  height: 72px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }

  @media (max-width: 1023px) {
    height: 64px;
    padding: 0 4px;
  }
`;

const ItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const ItemIcon = styled.span<{ bg: string; color: string }>`
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: ${({ bg }) => bg};
  color: ${({ color }) => color};
`;

const ItemLabel = styled.span`
  color: #1c2a44;
  font-size: 20px;
  font-weight: 800;

  @media (max-width: 1023px) {
    font-size: 16px;
    font-weight: 700;
  }
`;

const FooterText = styled.footer<{ desktop?: boolean }>`
  margin-top: ${({ desktop }) => (desktop ? "34px" : "26px")};
  color: #a7b2c5;
  font-size: ${({ desktop }) => (desktop ? "14px" : "13px")};
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 18px;

  button {
    border: 0;
    padding: 0;
    background: transparent;
    color: #9ca8bd;
    font-size: inherit;
    text-decoration: underline;
    cursor: pointer;
  }
`;

const HelpFab = styled.button`
  position: absolute;
  right: 24px;
  bottom: 24px;
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 50%;
  background: #0a1a35;
  color: #fff;
  font-size: 24px;
  font-weight: 800;
  cursor: pointer;
`;
