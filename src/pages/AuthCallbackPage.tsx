import { useEffect } from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { completeAuthFromRedirectHash } from "../auth/auth";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  useEffect(() => {
    const callbackResult = completeAuthFromRedirectHash(window.location.hash);

    if (!callbackResult) {
      navigate("/login", { replace: true });
      return;
    }

    const sanitizedUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, document.title, sanitizedUrl);

    void refreshSession().finally(() => {
      navigate("/dashboard", { replace: true });
    });
  }, [navigate, refreshSession]);

  return <LoadingText>로그인 처리 중...</LoadingText>;
}

const LoadingText = styled.p`
  min-height: 100dvh;
  margin: 0;
  display: grid;
  place-items: center;
`;
