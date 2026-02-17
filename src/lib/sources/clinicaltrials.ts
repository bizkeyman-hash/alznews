import { RawArticle } from "@/types/news";
import { getCached, setCache } from "@/lib/cache";

const CACHE_KEY = "clinicaltrials-articles";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CTStudy {
  protocolSection: {
    identificationModule: {
      nctId: string;
      briefTitle: string;
      officialTitle?: string;
    };
    statusModule: {
      lastUpdateSubmitDate?: string;
      statusVerifiedDate?: string;
    };
    descriptionModule?: {
      briefSummary?: string;
    };
    sponsorCollaboratorsModule?: {
      leadSponsor?: {
        name?: string;
      };
    };
  };
}

interface CTResponse {
  studies: CTStudy[];
}

export async function fetchClinicalTrials(): Promise<RawArticle[]> {
  const cached = getCached<RawArticle[]>(CACHE_KEY);
  if (cached) return cached;

  const url = new URL("https://clinicaltrials.gov/api/v2/studies");
  url.searchParams.set("query.cond", "Alzheimer Disease");
  url.searchParams.set("sort", "LastUpdatePostDate:desc");
  url.searchParams.set("pageSize", "20");
  url.searchParams.set(
    "fields",
    "NCTId,BriefTitle,OfficialTitle,BriefSummary,LastUpdateSubmitDate,StatusVerifiedDate,LeadSponsorName"
  );

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    console.error(`[ClinicalTrials] HTTP ${res.status}`);
    return [];
  }

  const data: CTResponse = await res.json();

  const articles: RawArticle[] = (data.studies ?? []).map((study) => {
    const id = study.protocolSection.identificationModule;
    const status = study.protocolSection.statusModule;
    const desc = study.protocolSection.descriptionModule;
    const sponsor = study.protocolSection.sponsorCollaboratorsModule;

    return {
      title: id.briefTitle,
      description: (desc?.briefSummary ?? "").slice(0, 500),
      url: `https://clinicaltrials.gov/study/${id.nctId}`,
      source: sponsor?.leadSponsor?.name || "ClinicalTrials.gov",
      publishedAt:
        status.lastUpdateSubmitDate || status.statusVerifiedDate || new Date().toISOString(),
      language: "en" as const,
    };
  });

  setCache(CACHE_KEY, articles, CACHE_TTL);
  return articles;
}
