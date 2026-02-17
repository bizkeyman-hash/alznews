// Priority order: aribio → regulation → competition → market → research (default)
const CATEGORY_RULES: [string, string[]][] = [
  [
    "aribio",
    [
      "아리바이오",
      "aribio",
      "ar1001",
      "ar-1001",
    ],
  ],
  [
    "regulation",
    [
      "FDA",
      "EMA",
      "식약처",
      "CMS",
      "보험 급여",
      "보험급여",
      "medicare",
      "medicaid",
      "승인",
      "허가",
      "approval",
      "approved",
      "clearance",
      "fast track",
      "신속 심사",
      "breakthrough therapy",
      "가이드라인",
      "guideline",
      "규제",
      "regulation",
      "regulatory",
      "reimbursement",
    ],
  ],
  [
    "competition",
    [
      // 승인·후기 임상 약물
      "에자이", "eisai", "레켐비", "leqembi", "레카네맙", "lecanemab",
      "일라이 릴리", "eli lilly", "키선라", "kisunla", "도나네맙", "donanemab",
      "바이오젠", "biogen", "아두카누맙", "aducanumab", "aduhelm",
      "로슈", "roche",
      // FDA 임상 중 후보물질
      "remternetug", "렘터네투맙",
      "trontinemab", "트론티네맙",
      "gantenerumab", "간테네루맙",
      "solanezumab", "솔라네주맙",
      "simufilam", "시뮤필람", "cassava sciences", "카사바",
      "alz-801", "valiltramiprosate", "알제온", "alzheon",
      "buntanetap", "분타네탑", "posiphen", "annovis bio", "어노비스",
      "tbp-pi-het", "tb006", "truebinding",
      "masitinib", "마시티닙", "ab science",
      "aci-24", "ac immune",
      "ub-311", "united biomedical",
      "semaglutide", "세마글루타이드", "novo nordisk", "노보노디스크",
      "tirzepatide", "티르제파타이드",
      "brexpiprazole", "rexulti", "렉술티", "otsuka", "lundbeck",
      // 일반 경쟁 키워드
      "경쟁", "competitor", "rival", "pipeline",
    ],
  ],
  [
    "market",
    [
      "시장",
      "market",
      "매출",
      "revenue",
      "sales",
      "투자",
      "investment",
      "M&A",
      "인수",
      "합병",
      "acquisition",
      "merger",
      "IPO",
      "주가",
      "stock",
      "바이오 섹터",
      "billion",
      "달러",
      "펀딩",
      "funding",
      "venture",
      "valuation",
    ],
  ],
  [
    "research",
    [
      "연구",
      "research",
      "study",
      "아밀로이드",
      "amyloid",
      "타우",
      "tau",
      "TREM2",
      "PDE5",
      "임상",
      "clinical",
      "phase",
      "논문",
      "paper",
      "journal",
      "발견",
      "discovery",
      "메커니즘",
      "mechanism",
      "바이오마커",
      "biomarker",
      "p-tau",
      "신경",
      "neuro",
      "병리",
      "pathology",
    ],
  ],
];

export function categorize(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  for (const [category, keywords] of CATEGORY_RULES) {
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        return category;
      }
    }
  }

  return "research";
}
