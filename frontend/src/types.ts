export type Role = 'STUDENT' | 'COMPANY' | 'STAFF' | 'ADMIN' | 'MENTOR';

export interface User {
  id: number;
  email: string;
  role: Role;
  first_name: string;
  last_name: string;
  patronymic?: string;
  phone?: string;
  avatar_url?: string;
  company?: {
    id: number;
    full_name: string;
    short_name: string;
    logo_url?: string;
    is_moderated: boolean;
  };
}

export interface Milestone {
  id: number;
  order_index: number;
  title: string;
  description?: string;
  due_date?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'NEEDS_REVISION' | 'ACCEPTED';
  reviewer_comment?: string;
}

export interface CaseProject {
  id: number;
  title: string;
  company_id: number;
  company_name: string;
  company_logo?: string;
  short_description: string;
  full_specification: string;
  direction: string;
  difficulty: string;
  participation_format: string;
  work_format: string;
  max_participants: number;
  required_competencies: string[];
  recommended_technologies: string[];
  target_courses: number[];
  deadline_date?: string;
  application_deadline?: string;
  expected_result?: string;
  evaluation_criteria_desc?: string;
  selection_type: string;
  category: 'EDUCATIONAL' | 'CONTEST' | 'PAID' | 'OTHER_REWARD';
  reward_description?: string;
  has_payment: boolean;
  payment_amount?: number;
  prize_fund?: number;
  payment_status: string;
  has_internship: boolean;
  ip_rights_terms: string;
  is_confidential: boolean;
  status: string;
  moderation_status: string;
  moderation_comment?: string;
  created_at: string;
  updated_at: string;
  is_favorite?: boolean;
  is_nda_signed?: boolean;
  applications_count: number;
  milestones: Milestone[];
}

export interface Review {
  id: number;
  submission_id: number;
  reviewer_id: number;
  reviewer_name?: string;
  score_completeness: number;
  score_implementation_quality: number;
  score_code_quality: number;
  score_architecture: number;
  score_spec_compliance: number;
  score_usability: number;
  score_originality: number;
  score_documentation: number;
  score_deadline_adherence: number;
  score_teamwork: number;
  total_score: number;
  company_feedback: string;
  created_at: string;
}

export interface Submission {
  id: number;
  team_id: number;
  team_name?: string;
  milestone_id?: number;
  is_final: boolean;
  solution_description: string;
  repository_url?: string;
  demo_url?: string;
  presentation_url?: string;
  video_url?: string;
  screenshots: string[];
  documentation_url?: string;
  status: string;
  submitted_at: string;
  reviews: Review[];
}

export interface TeamMember {
  id: number;
  user_id: number;
  user_name: string;
  role: string;
  competencies: string[];
  joined_at: string;
}

export interface Team {
  id: number;
  case_id: number;
  case_title?: string;
  name: string;
  team_lead_id: number;
  team_lead_name: string;
  mentor_id?: number;
  mentor_name?: string;
  status: string;
  created_at: string;
  members: TeamMember[];
}

export interface StudentShowcaseProject {
  id: number;
  author_id: number;
  author_name: string;
  author_faculty?: string;
  author_course?: number;
  title: string;
  cover_image_url?: string;
  project_type: string;
  short_description: string;
  detailed_description?: string;
  problem_solved?: string;
  technologies: string[];
  direction: string;
  github_url?: string;
  gitlab_url?: string;
  live_demo_url?: string;
  presentation_url?: string;
  video_url?: string;
  screenshots: string[];
  seeking_partner: boolean;
  seeking_team: boolean;
  seeking_mentor: boolean;
  seeking_investor: boolean;
  open_for_internship: boolean;
  open_for_job: boolean;
  moderation_status: string;
  likes_count: number;
  created_at: string;
}

export interface AnalyticsSummary {
  overview: {
    total_companies: number;
    active_companies: number;
    total_cases: number;
    cases_active: number;
    cases_in_progress: number;
    cases_completed: number;
    total_students: number;
    active_students: number;
    total_prize_fund: number;
  };
  directions: { name: string; count: number }[];
  categories: {
    EDUCATIONAL: number;
    CONTEST: number;
    PAID: number;
    OTHER_REWARD: number;
  };
  top_companies: {
    name: string;
    cases_count: number;
    completed_count: number;
  }[];
}
