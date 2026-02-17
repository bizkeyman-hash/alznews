import { Article } from "@/types/news";

// URL-based persistent in-memory score cache
const scoreCache = new Map<string, number>();

export function clearScoreCache(): void {
  scoreCache.clear();
}

// Weighted keyword rules from AriBio investor perspective
const SCORING_RULES: [string[], number][] = [
  // 10: 아리바이오 직접 관련
  [["아리바이오", "aribio", "ar1001", "ar-1001"], 10],

  // 8-9: 직접 경쟁사 핵심, FDA/EMA 규제
  [["fda 승인", "fda approved", "fda approval", "fda clearance"], 9],
  [["ema 승인", "ema approved", "ema approval"], 9],
  [["식약처 승인", "식약처 허가"], 9],
  [["cms", "medicare", "보험 급여", "보험급여", "reimbursement"], 9],
  [["phase 3", "phase iii", "3상", "pivotal trial"], 8],
  [["lecanemab", "레카네맙", "donanemab", "도나네맙", "aducanumab", "아두카누맙"], 8],
  [["kisunla", "키선라", "leqembi", "레켐비"], 8],
  [["remternetug", "렘터네투맙", "trontinemab", "트론티네맙"], 8],
  [["simufilam", "시뮤필람", "cassava sciences"], 7],
  [["alz-801", "valiltramiprosate", "alzheon", "알제온"], 7],
  [["buntanetap", "분타네탑", "annovis bio"], 7],
  [["semaglutide", "세마글루타이드", "novo nordisk", "노보노디스크"], 7],
  [["tirzepatide", "티르제파타이드"], 7],
  [["masitinib", "마시티닙", "ab science"], 7],
  [["brexpiprazole", "rexulti", "렉술티"], 6],
  [["aci-24", "ac immune", "ub-311"], 6],
  [["인수합병", "m&a", "acquisition", "buyout", "merger"], 8],

  // 6-7: 임상, 규제, 경쟁 파이프라인
  [["phase 2", "phase ii", "2상"], 7],
  [["fast track", "breakthrough therapy", "신속 심사", "혁신 신약"], 7],
  [["trem2", "pde5"], 7],
  [["clinical trial", "임상시험", "임상 결과"], 7],
  [["biogen", "바이오젠", "eisai", "에자이", "eli lilly", "일라이 릴리", "roche", "로슈", "otsuka", "lundbeck"], 7],
  [["anti-amyloid", "항아밀로이드", "anti-tau", "항타우"], 6],
  [["bace inhibitor", "bace 억제"], 6],
  [["pipeline", "파이프라인"], 6],
  [["market forecast", "시장 전망", "시장 규모"], 6],

  // 5: 바이오마커, 산업 동향
  [["biomarker", "바이오마커", "p-tau", "ptau"], 5],
  [["amyloid", "아밀로이드"], 5],
  [["tau protein", "타우 단백질", "타우 병리"], 5],
  [["blood test", "혈액 검사", "혈액 진단"], 5],
  [["neuroinflammation", "신경염증"], 5],
  [["ipo", "주가", "stock price", "매출", "revenue"], 5],

  // 3-4: 일반 연구
  [["alzheimer", "알츠하이머"], 3],
  [["dementia", "치매"], 3],
  [["cognitive decline", "인지기능 저하", "인지 저하"], 4],
  [["neurodegeneration", "신경퇴행"], 3],
];

function computeScore(title: string, description: string): number {
  const text = `${title} ${description.slice(0, 200)}`.toLowerCase();

  let maxScore = 1;

  for (const [keywords, weight] of SCORING_RULES) {
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        if (weight > maxScore) maxScore = weight;
        break;
      }
    }
  }

  return maxScore;
}

export async function scoreArticles(articles: Article[]): Promise<Article[]> {
  return articles.map((article) => {
    const cached = scoreCache.get(article.url);
    if (cached !== undefined) {
      return { ...article, importance: cached };
    }

    const score = computeScore(article.title, article.description);
    scoreCache.set(article.url, score);
    return { ...article, importance: score };
  });
}
