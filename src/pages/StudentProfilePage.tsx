import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert } from "../components/ui/alert";
import { useAuth } from "../contexts/AuthContext";
import { loadStudentProfile, saveStudentProfile, type StudentProfileForm } from "../utils/studentProfileStorage";

const titles = ["ด.ช.", "ด.ญ.", "นาย", "นางสาว"];
const grades = ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"];
const rooms = ["1", "2", "3", "4", "5", "6", "7", "8"];

export function StudentProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<StudentProfileForm>({ title: "นาย", first_name: "", last_name: "", grade_level: "ม.5", class_group: "1", student_no: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const cachedProfile = loadStudentProfile(user?.uid, user?.email);
    if (cachedProfile) setForm(cachedProfile);

    api.me().then((me) => {
      if (me.role === "teacher") navigate("/teacher", { replace: true });
      if (me.student) {
        const nextForm = {
          title: me.student.title || "นาย",
          first_name: me.student.first_name || cachedProfile?.first_name || "",
          last_name: me.student.last_name || cachedProfile?.last_name || "",
          grade_level: me.student.grade_level || "ม.5",
          class_group: me.student.class_group || "1",
          student_no: me.student.student_no || cachedProfile?.student_no || "",
        };
        setForm(nextForm);
        saveStudentProfile(nextForm, user?.uid, user?.email);
      }
    });
  }, [navigate, user?.email, user?.uid]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const result = await api.updateProfile(form);
      saveStudentProfile(result.student, user?.uid, user?.email);
      navigate("/exams");
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    }
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader><CardTitle>ข้อมูลนักเรียน</CardTitle></CardHeader>
      <CardContent>
        <form className="grid gap-3" onSubmit={submit}>
          {error && <Alert className="border-destructive text-destructive">{error}</Alert>}
          <select className="login-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}>
            {titles.map((title) => <option key={title}>{title}</option>)}
          </select>
          <input className="login-input" placeholder="ชื่อ" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
          <input className="login-input" placeholder="นามสกุล" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
          <input className="login-input" placeholder="เลขที่" value={form.student_no} onChange={(e) => setForm({ ...form, student_no: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <select className="login-input" value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })}>
              {grades.map((grade) => <option key={grade}>{grade}</option>)}
            </select>
            <select className="login-input" value={form.class_group} onChange={(e) => setForm({ ...form, class_group: e.target.value })}>
              {rooms.map((room) => <option key={room}>{room}</option>)}
            </select>
          </div>
          <Button type="submit">บันทึกและไปหน้าข้อสอบ</Button>
        </form>
      </CardContent>
    </Card>
  );
}
