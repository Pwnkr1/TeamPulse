export interface KnowledgeItem {
  source: 'github' | 'hackernews' | 'reddit' | 'stackoverflow';
  title: string;
  body: string;
  url: string;
  votes: number;
  createdAt: string;
  qualityScore: number;
  relevanceScore: number;
  communityScore: number;
  recencyScore: number;
  claims: string[];
}

export interface ClassificationResult {
  category: string;
  confidence: number;
  summary: string;
}

export interface GeneratedQuestion {
  text: string;
  options: string[];
  insightLabel: string;
  sourceRef: string;
  orderIndex: number;
}

export interface SurveyPipeline {
  classification: ClassificationResult;
  knowledgeItems: KnowledgeItem[];
  questions: GeneratedQuestion[];
  sourceBreakdown: Record<string, number>;
}

export interface JwtPayload {
  userId: string;
  role: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
