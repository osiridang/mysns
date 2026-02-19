import imgImage3 from "figma:asset/b2b1f396ae87ee6016813666c89a065de3465c58.png";

export default function Group() {
  return (
    <div className="relative size-full">
      <div className="absolute h-[133px] left-0 top-0 w-[720px]" data-name="image 3">
        <img alt="" className="block max-w-none size-full" height="133" src={imgImage3} width="720" />
      </div>
      <p className="-translate-x-full absolute font-['Paperlogy:7_Bold',sans-serif] leading-[0] left-[296px] not-italic text-[28px] text-right text-white top-[36px]">
        <span className="leading-[normal]">{`가장 `}</span>
        <span className="leading-[normal] text-[#0ef1ff]">개혁적인 도지사</span>
      </p>
      <p className="absolute font-['Paperlogy:3_Light',sans-serif] leading-[normal] left-[535px] not-italic text-[16px] text-white top-[39px]">제 21대, 22대 국회의원</p>
      <p className="absolute font-['Paperlogy:3_Light',sans-serif] leading-[normal] left-[535px] not-italic text-[16px] text-white top-[63px]">전) 전라북도 정부부지사</p>
      <p className="absolute font-['Paperlogy:3_Light',sans-serif] leading-[normal] left-[535px] not-italic text-[16px] text-white top-[87px]">전) 청와대 행정관</p>
      <p className="-translate-x-full absolute font-['Paperlogy:7_Bold',sans-serif] h-[32px] leading-[0] left-[296px] not-italic text-[28px] text-right text-white top-[70px] w-[265px] whitespace-pre-wrap">
        <span className="leading-[normal]">{`일 잘하는 `}</span>
        <span className="leading-[normal] text-[#0ef1ff]">따듯한 도지사</span>
      </p>
      <p className="absolute font-['Paperlogy:7_Bold',sans-serif] leading-[normal] left-[313px] not-italic text-[75px] text-white top-[27px]">이원택</p>
    </div>
  );
}