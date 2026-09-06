import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  th: {
    translation: {
      appName: "ระบบสอบออนไลน์",
      language: "ภาษา",
      thai: "ไทย",
      english: "EN",
      signOut: "ออกจากระบบ",
      loading: "กำลังโหลด...",
      login: {
        title: "เข้าสู่ระบบนักเรียน",
        subtitle: "เข้าสู่ระบบเพื่อเริ่มทำข้อสอบออนไลน์",
        email: "อีเมล",
        password: "รหัสผ่าน",
        signIn: "เข้าสู่ระบบ",
        signingIn: "กำลังเข้าสู่ระบบ...",
        or: "หรือ",
        google: "เข้าสู่ระบบด้วย Google",
        apiDisconnected: "เชื่อมต่อ Backend API ไม่ได้",
        footerRights: "สงวนลิขสิทธิ์",
        school: "Saparachinee 2 School",
        lastUpdated: "อัปเดตล่าสุด: กันยายน 2026",
      },
      exams: {
        title: "รายการข้อสอบ",
        minutes: "นาที",
        questions: "ข้อ",
        openInstructions: "เปิดคำชี้แจง",
        empty: "ยังไม่มีข้อสอบที่เปิดใช้งาน",
      },
      instructions: {
        duration: "เวลา",
        questions: "จำนวนข้อ",
        maxViolations: "เตือนสูงสุด",
        antiCheat: "ให้หน้าต่างนี้อยู่ด้านหน้า และอยู่ในโหมดเต็มหน้าจอเมื่อระบบแจ้ง การตรวจจับเบราว์เซอร์เป็นเพียงการตรวจสอบเท่านั้น",
        start: "เริ่มสอบ",
        starting: "กำลังเริ่ม...",
      },
      exam: {
        loading: "กำลังโหลดข้อสอบ...",
        saveStatus: "สถานะบันทึก",
        ready: "พร้อม",
        saving: "กำลังบันทึก",
        saved: "บันทึกแล้ว",
        failed: "บันทึกไม่สำเร็จ",
        submit: "ส่งข้อสอบ",
      },
      result: {
        loading: "กำลังโหลดผลสอบ...",
        title: "ผลสอบ",
        status: "สถานะ",
        hidden: "คะแนนถูกซ่อนตามการตั้งค่าข้อสอบ",
        back: "กลับไปหน้าข้อสอบ",
      },
      locked: {
        title: "ข้อสอบถูกล็อก",
        message: "เซสชันของคุณถูกล็อกหลังทำผิดเงื่อนไขการโฟกัสครบจำนวนที่กำหนด",
        back: "กลับไปหน้าข้อสอบ",
      },
    },
  },
  en: {
    translation: {
      appName: "School Exam System",
      language: "Language",
      thai: "TH",
      english: "English",
      signOut: "Sign out",
      loading: "Loading...",
      login: {
        title: "Student Login",
        subtitle: "Sign in to start your online exam",
        email: "Email",
        password: "Password",
        signIn: "Sign in",
        signingIn: "Signing in...",
        or: "or",
        google: "Login with Google",
        apiDisconnected: "Backend API is not connected.",
        footerRights: "All Rights",
        school: "Saparachinee 2 School",
        lastUpdated: "Last Updated: September 2026",
      },
      exams: {
        title: "Available Exams",
        minutes: "minutes",
        questions: "questions",
        openInstructions: "Open instructions",
        empty: "No active exams are available.",
      },
      instructions: {
        duration: "Duration",
        questions: "Questions",
        maxViolations: "Max violations",
        antiCheat: "Keep this window focused and stay in fullscreen when instructed. Browser checks are detection only.",
        start: "Start exam",
        starting: "Starting...",
      },
      exam: {
        loading: "Loading exam...",
        saveStatus: "Save status",
        ready: "Ready",
        saving: "saving",
        saved: "saved",
        failed: "failed",
        submit: "Submit exam",
      },
      result: {
        loading: "Loading result...",
        title: "Exam Result",
        status: "Status",
        hidden: "Score is hidden by the exam settings.",
        back: "Back to exams",
      },
      locked: {
        title: "Exam locked",
        message: "Your session was locked after reaching the allowed number of focus violations.",
        back: "Return to exams",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") ?? "th",
  fallbackLng: "th",
  interpolation: { escapeValue: false },
});

export default i18n;
