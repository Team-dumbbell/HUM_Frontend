import styled from "@emotion/styled";
import { FiMusic, FiShield, FiZap } from "react-icons/fi";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type LocationState = {
  from?: string;
};

export default function LoginPage() {
  const location = useLocation();
  const { loginWithGoogle, isLoggedIn } = useAuth();
  const target = (location.state as LocationState | null)?.from || "/dashboard";

  if (isLoggedIn) {
    return <Navigate to={target} replace />;
  }

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <Page>
      <Card>
        <Hero>
          <HeroVideo autoPlay muted loop playsInline preload="metadata">
            <source src="/HUM.mp4" type="video/mp4" />
          </HeroVideo>
          <HeroTint />
          <Brand>
            <BrandMark>
              <FiMusic size={15} />
            </BrandMark>
            <BrandName>Vinsign Music</BrandName>
          </Brand>

          <HeroTitle>
            음악에서 배우는
            <br />
            새로운 언어의 즐거움
          </HeroTitle>
          <HeroText>
            좋아하는 곡의 가사 속 단어를 자동으로 캡처하고
            <br />
            당신만의 학습 로그를 만들어보세요.
          </HeroText>
        </Hero>

        <LoginPanel>
          <Heading>반가워요!</Heading>
          <SubHeading>서비스 이용을 위해 로그인이 필요합니다.</SubHeading>

          <LoginButton type="button" onClick={handleGoogleLogin}>
            <GoogleMark>G</GoogleMark>
            구글 계정으로 시작하기
          </LoginButton>

          <Divider>
          </Divider>

          <FeatureRow>
            <FeatureCard>
              <FeatureIcon>
                <FiZap size={14} />
              </FeatureIcon>
              <FeatureTitle>간편한 연동</FeatureTitle>
              <FeatureText>클릭 한 번으로 모든 기기에서 동기화됩니다.</FeatureText>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>
                <FiShield size={14} />
              </FeatureIcon>
              <FeatureTitle>안전한 보안</FeatureTitle>
              <FeatureText>구글 보안 표준을 준수하여 보호됩니다.</FeatureText>
            </FeatureCard>
          </FeatureRow>

          <PolicyText>
            로그인 시 서비스 <b>이용약관</b> 및 <b>개인정보처리방침</b>에
            <br />
            동의하는 것으로 간주됩니다.
          </PolicyText>
        </LoginPanel>
      </Card>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100dvh;
  padding: 28px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 15% 10%, rgba(40, 227, 180, 0.22), transparent 35%),
    radial-gradient(circle at 85% 90%, rgba(22, 162, 118, 0.2), transparent 32%),
    #f3f5fa;

  @media (max-width: 860px) {
    padding: 0;
    background: #0a1f27;
  }
`;

const Card = styled.section`
  width: min(1080px, 100%);
  min-height: min(760px, calc(100dvh - 56px));
  background: #fff;
  border-radius: 38px;
  box-shadow: 0 22px 45px rgba(8, 24, 53, 0.12);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 860px) {
    border-radius: 0;
    box-shadow: none;
    min-height: 100dvh;
    grid-template-columns: 1fr;
    grid-template-rows: minmax(365px, 52dvh) auto;
  }
`;

const Hero = styled.div`
  position: relative;
  overflow: hidden;
  padding: 44px 48px 40px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: #041217;

  @media (max-width: 860px) {
    border-radius: 0 0 30px 30px;
    padding: 36px 32px 28px;
    justify-content: space-between;
  }
`;

const HeroVideo = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
`;

const HeroTint = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 0%, rgba(9, 245, 184, 0.2), transparent 35%),
    linear-gradient(160deg, rgba(4, 18, 23, 0.72) 10%, rgba(5, 34, 41, 0.58) 45%, rgba(5, 58, 52, 0.64) 100%);
  z-index: 1;
`;

const Brand = styled.div`
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 11px;
  align-self: flex-start;
`;

const BrandMark = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: #00cb94;
  display: grid;
  place-items: center;
  color: #fff;
`;

const BrandName = styled.span`
  font-size: 37px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;

  @media (max-width: 1260px) {
    font-size: 30px;
  }

  @media (max-width: 500px) {
    font-size: 19px;
  }
`;

const HeroTitle = styled.h1`
  position: relative;
  z-index: 2;
  margin: 0;
  font-size: clamp(35px, 5vw, 58px);
  letter-spacing: -0.03em;
  line-height: 1.17;
`;

const HeroText = styled.p`
  position: relative;
  z-index: 2;
  margin: 18px 0 0;
  color: rgba(222, 255, 246, 0.84);
  font-size: clamp(20px, 2vw, 27px);
  line-height: 1.45;
`;

const LoginPanel = styled.div`
  padding: clamp(34px, 4vw, 58px);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Heading = styled.h2`
  margin: 0;
  color: #0a1431;
  font-size: clamp(33px, 3.2vw, 47px);
  letter-spacing: -0.02em;
`;

const SubHeading = styled.p`
  margin: 12px 0 0;
  color: #63708c;
  font-size: clamp(20px, 1.7vw, 27px);
  line-height: 1.45;
`;

const LoginButton = styled.button`
  margin-top: clamp(26px, 2.8vw, 38px);
  height: clamp(64px, 6vw, 84px);
  border: 1px solid #e7ecf5;
  border-radius: 17px;
  background: #fff;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  color: #17284d;
  font-size: clamp(24px, 1.95vw, 34px);
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(8, 24, 53, 0.1);
  }
`;

const GoogleMark = styled.span`
  width: clamp(28px, 2vw, 36px);
  height: clamp(28px, 2vw, 36px);
  border-radius: 50%;
  color: #101b38;
  display: grid;
  place-items: center;
  font-size: clamp(22px, 1.8vw, 29px);
  font-weight: 800;
`;

const Divider = styled.div`
  margin-top: clamp(26px, 2.6vw, 38px);
  display: flex;
  align-items: center;
  gap: 14px;
  color: #adb7cc;
  font-size: clamp(13px, 1vw, 15px);
  letter-spacing: 0.2em;
  font-weight: 700;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #edf1f8;
  }

  span {
    white-space: nowrap;
  }
`;

const FeatureRow = styled.div`
  margin-top: clamp(30px, 3vw, 42px);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 860px) {
    gap: 12px;
  }
`;

const FeatureCard = styled.div`
  border-radius: 15px;
  background: #f4fff9;
  padding: clamp(16px, 1.6vw, 20px);
`;

const FeatureIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #dfffee;
  color: #00a36c;
  display: grid;
  place-items: center;
`;

const FeatureTitle = styled.h3`
  margin: 10px 0 0;
  font-size: clamp(18px, 1.3vw, 20px);
  color: #10203d;
`;

const FeatureText = styled.p`
  margin: 7px 0 0;
  color: #70809f;
  font-size: clamp(14px, 1.05vw, 16px);
  line-height: 1.45;
`;

const PolicyText = styled.p`
  margin: clamp(28px, 3vw, 40px) 0 0;
  text-align: center;
  color: #9aa5bb;
  font-size: clamp(14px, 1vw, 16px);
  line-height: 1.55;

  b {
    color: #02ac73;
  }
`;
