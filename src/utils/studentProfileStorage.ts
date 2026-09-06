import type { Student } from "../types/exam";

export type StudentProfileForm = Pick<Student, "title" | "first_name" | "last_name" | "grade_level" | "class_group" | "student_no">;

const STORAGE_PREFIX = "school-exam-student-profile";

const fallbackProfile: StudentProfileForm = {
  title: "นาย",
  first_name: "",
  last_name: "",
  grade_level: "ม.5",
  class_group: "1",
  student_no: "",
};

function storageKeys(uid?: string, email?: string | null) {
  return [
    uid ? `${STORAGE_PREFIX}:uid:${uid}` : "",
    email ? `${STORAGE_PREFIX}:email:${email.toLowerCase()}` : "",
  ].filter(Boolean);
}

function normalizeProfile(profile: Partial<StudentProfileForm> | undefined): StudentProfileForm {
  return {
    title: profile?.title || fallbackProfile.title,
    first_name: profile?.first_name || fallbackProfile.first_name,
    last_name: profile?.last_name || fallbackProfile.last_name,
    grade_level: profile?.grade_level || fallbackProfile.grade_level,
    class_group: profile?.class_group || fallbackProfile.class_group,
    student_no: profile?.student_no || fallbackProfile.student_no,
  };
}

export function isCompleteStudentProfile(profile: Partial<StudentProfileForm> | null | undefined): profile is StudentProfileForm {
  return Boolean(
    profile?.title &&
      profile.first_name &&
      profile.last_name &&
      profile.grade_level &&
      profile.class_group &&
      profile.student_no,
  );
}

export function loadStudentProfile(uid?: string, email?: string | null): StudentProfileForm | null {
  for (const key of storageKeys(uid, email)) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      return normalizeProfile(JSON.parse(raw) as Partial<StudentProfileForm>);
    } catch {
      window.localStorage.removeItem(key);
    }
  }

  return null;
}

export function saveStudentProfile(profile: StudentProfileForm, uid?: string, email?: string | null) {
  const serialized = JSON.stringify(normalizeProfile(profile));
  for (const key of storageKeys(uid, email)) {
    window.localStorage.setItem(key, serialized);
  }
}
