import styled from "@emotion/styled";
import { FiSearch } from "react-icons/fi";

export default function TopSearchBar(props: {
  value: string;
  onChange: (value: string) => void;
  wide?: boolean;
  placeholder?: string;
}) {
  return (
    <SearchWrap wide={props.wide}>
      <FiSearch size={18} />
      <Input
        placeholder={props.placeholder ?? "곡명 또는 아티스트 검색"}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </SearchWrap>
  );
}

const SearchWrap = styled.label<{ wide?: boolean }>`
  width: ${({ wide }) => (wide ? "min(540px, 100%)" : "100%")};
  height: 46px;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.line};
  border-radius: 14px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #a3aec0;
`;

const Input = styled.input`
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  color: ${({ theme }) => theme.color.text};
  font-size: 16px;

  &::placeholder {
    color: #a3aec0;
  }
`;
