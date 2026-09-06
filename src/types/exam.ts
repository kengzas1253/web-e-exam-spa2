export type Student = {
  student_id: string;
  student_no: string;
  name: string;
  title: string;
  first_name: string;
  last_name: string;
  class_name: string;
  grade_level: string;
  class_group: string;
  email: string;
  status: string;
};

export type Teacher = {
  teacher_id: string;
  name: string;
  email: string;
  status: string;
};

export type Me = {
  role: "student" | "teacher";
  student?: Student;
  teacher?: Teacher;
};

export type Exam = {
  exam_id: string;
  exam_name: string;
  teacher_uid?: string;
  subject: string;
  grade_level: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  question_count: number;
  max_violations: number;
  show_score: boolean;
  status: string;
};

export type Choice = {
  choice_id: string;
  choice_text: string;
};

export type Question = {
  question_id: string;
  exam_id: string;
  question_text: string;
  question_type: string;
  image_url?: string;
  score: number;
  choices: Choice[];
};

export type ExamSession = {
  session_id: string;
  exam_id: string;
  student_id: string;
  start_time: string;
  end_time: string;
  submit_time: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "TIMEOUT" | "LOCKED";
  score: number;
  total_score: number;
  violation_count: number;
};

export type SessionDetails = {
  exam: Exam;
  session: ExamSession;
  student: Student;
  questions: Question[];
  answers: Record<string, string>;
};

export type TeacherDashboard = {
  exams: Array<Exam & {
    submitted_count: number;
    locked_count: number;
    questions: Array<{
      question_id: string;
      question_text: string;
      score: number;
      choices: Array<{ choice_text: string; is_correct: boolean }>;
    }>;
  }>;
  sessions: Array<ExamSession & { exam_name?: string; student: Student }>;
};
