import type { FontFamilyOption } from "@shnea/blocknote";

export const exampleFontOptions: FontFamilyOption[] = [
  {
    key: "pretendard",
    label: "Pretendard",
    value: "\"Pretendard\", sans-serif",
    faces: [
      {
        url: "https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.2.1/static/woff2/Pretendard-Regular.woff2",
        weight: "400"
      },
      {
        url: "https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.2.1/static/woff2/Pretendard-SemiBold.woff2",
        weight: "600"
      }
    ]
  },
  {
    key: "noto-sans-kr",
    label: "Noto Sans KR",
    value: "\"Noto Sans KR\", sans-serif",
    stylesheetUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600&display=swap"
  },
  {
    key: "spoqa-han-sans-neo",
    label: "Spoqa Han Sans Neo",
    value: "\"Spoqa Han Sans Neo\", sans-serif",
    stylesheetUrl: "https://spoqa.github.io/spoqa-han-sans/css/SpoqaHanSansNeo.css"
  },
  {
    key: "suit",
    label: "SUIT",
    value: "\"SUIT\", sans-serif",
    stylesheetUrl: "https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/static/woff2/SUIT.css"
  },
  {
    key: "line-seed-kr",
    label: "LINE Seed KR",
    value: "\"LINE Seed KR\", sans-serif",
    url: "https://seed.line.me/src/images/fonts/LINE_SeedKR_2023.09.06/Web/woff2/LINESeedKR-Rg.woff2"
  },
  {
    key: "lotteria-chab",
    label: "롯데리아 촵땡겨체",
    value: "\"LOTTERIACHAB\", sans-serif",
    url: "https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2302@1.0/LOTTERIACHAB.woff2"
  },
  {
    key: "climate-crisis-korean",
    label: "기후위기체",
    value: "\"ClimateCrisisKorean\", sans-serif",
    url: "https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2212@1.0/ClimateCrisisKR-2030.woff2"
  },
  {
    key: "changwon-danggam-asak",
    label: "창원단감아삭체",
    value: "\"ChangwonDanggamAsak\", sans-serif",
    url: "https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2108@1.1/CWDangamAsac-Bold.woff",
    format: "woff"
  },
  {
    key: "pyeongchang-peace",
    label: "평창평화체",
    value: "\"PyeongChangPeace\", sans-serif",
    url: "https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2206-02@1.0/PyeongChangPeace-Bold.woff2"
  },
  {
    key: "neo-dunggeunmo",
    label: "Neo둥근모",
    value: "\"NeoDunggeunmo\", monospace",
    url: "https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.3/NeoDunggeunmo.woff",
    format: "woff"
  }
];
