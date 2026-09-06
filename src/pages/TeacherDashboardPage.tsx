import { FormEvent, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { api } from "../services/api";
import type { TeacherDashboard } from "../types/exam";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MathText } from "../components/MathText";
import { Alert } from "../components/ui/alert";

const grades = ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"];
type QuestionForm = { question_text: string; choices: string[]; correct_index: number; score: number };
const emptyChoices = ["", "", "", ""];

export function TeacherDashboardPage({ scoresOnly = false }: { scoresOnly?: boolean }) {
  const [data, setData] = useState<TeacherDashboard | null>(null);
  const [form, setForm] = useState({ exam_name: "", subject: "", grade_level: "ม.5", description: "", duration_minutes: 60, question_count: 5, max_violations: 3 });
  const [questionForms, setQuestionForms] = useState<Record<string, QuestionForm>>({});
  const [durationForms, setDurationForms] = useState<Record<string, number>>({});
  const [editingQuestionId, setEditingQuestionId] = useState("");
  const [editForm, setEditForm] = useState<QuestionForm>({ question_text: "", choices: emptyChoices, correct_index: 0, score: 1 });
  const [error, setError] = useState("");

  const load = () => api.teacherDashboard().then(setData);
  useEffect(() => { void load(); }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api.createExam(form);
      setForm({ ...form, exam_name: "", subject: "", description: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เพิ่มข้อสอบไม่สำเร็จ");
    }
  }

  async function addQuestion(event: FormEvent, examId: string) {
    event.preventDefault();
    setError("");
    const question = questionForms[examId] ?? { question_text: "", choices: emptyChoices, correct_index: 0, score: 1 };
    try {
      await api.createQuestion(examId, { ...question, choices: question.choices.slice(0, 4).filter(Boolean) });
      setQuestionForms({ ...questionForms, [examId]: { question_text: "", choices: emptyChoices, correct_index: 0, score: 1 } });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เพิ่มคำถามไม่สำเร็จ");
    }
  }

  function questionForm(examId: string) {
    return questionForms[examId] ?? { question_text: "", choices: emptyChoices, correct_index: 0, score: 1 };
  }

  function startEdit(question: TeacherDashboard["exams"][number]["questions"][number]) {
    const choices = question.choices.slice(0, 4);
    const correctIndex = choices.findIndex((choice) => choice.is_correct);
    setEditingQuestionId(question.question_id);
    setEditForm({
      question_text: question.question_text,
      choices: [...choices.map((choice) => choice.choice_text), ...emptyChoices].slice(0, 4),
      correct_index: correctIndex >= 0 ? correctIndex : 0,
      score: question.score || 1,
    });
  }

  async function saveEdit(examId: string, questionId: string) {
    setError("");
    try {
      await api.updateQuestion(examId, questionId, { ...editForm, choices: editForm.choices.slice(0, 4).filter(Boolean) });
      setEditingQuestionId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "แก้ไขคำถามไม่สำเร็จ");
    }
  }

  async function saveDuration(examId: string, durationMinutes: number) {
    setError("");
    try {
      await api.updateExam(examId, { duration_minutes: durationMinutes });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกเวลาไม่สำเร็จ");
    }
  }

  function exportScores() {
    const rows = data?.sessions ?? [];
    const escapeHtml = (value: string | number | undefined) =>
      String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
    const tableRows = rows.map((session) => `
      <tr>
        <td>${escapeHtml(session.exam_name)}</td>
        <td>${escapeHtml(session.student.name)}</td>
        <td>${escapeHtml(session.student.class_name)}</td>
        <td>${escapeHtml(session.student.student_no)}</td>
        <td>${escapeHtml(`${session.score}/${session.total_score}`)}</td>
        <td>${escapeHtml(session.status)}</td>
      </tr>
    `).join("");
    const html = `
      <html>
        <head><meta charset="UTF-8" /></head>
        <body>
          <table>
            <thead>
              <tr>
                <th>ข้อสอบ</th>
                <th>นักเรียน</th>
                <th>ชั้น</th>
                <th>เลขที่</th>
                <th>คะแนน</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;
    const url = URL.createObjectURL(new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `คะแนนนักเรียน-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Teacher Dashboard</h1>
      {error && <Alert className="border-destructive text-destructive">{error}</Alert>}
      {!scoresOnly && (
        <>
          <Card id="create-exam">
            <CardHeader><CardTitle>เพิ่มข้อสอบ</CardTitle></CardHeader>
            <CardContent>
              <form className="grid gap-3 md:grid-cols-3" onSubmit={create}>
                <input className="login-input" placeholder="ชื่อข้อสอบ" value={form.exam_name} onChange={(e) => setForm({ ...form, exam_name: e.target.value })} required />
                <input className="login-input" placeholder="วิชา" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                <select className="login-input" value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })}>{grades.map((g) => <option key={g}>{g}</option>)}</select>
                <input className="login-input" placeholder="รายละเอียด" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <input className="login-input" type="number" min="1" placeholder="เวลาในการสอบ (นาที)" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} required />
                <Button type="submit">เพิ่มข้อสอบ</Button>
              </form>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            {data?.exams.map((exam) => (
              <Card key={exam.exam_id}>
            <CardHeader><CardTitle>{exam.exam_name}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p>{exam.subject} · {exam.grade_level}</p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  className="login-input h-10 max-w-40"
                  type="number"
                  min="1"
                  value={durationForms[exam.exam_id] ?? exam.duration_minutes}
                  onChange={(e) => setDurationForms({ ...durationForms, [exam.exam_id]: Number(e.target.value) })}
                />
                <span className="text-sm text-muted-foreground">นาที</span>
                <Button type="button" onClick={() => saveDuration(exam.exam_id, durationForms[exam.exam_id] ?? exam.duration_minutes)}>บันทึกเวลา</Button>
              </div>
              <p>ส่งแล้ว {exam.submitted_count} · ถูกล็อก {exam.locked_count}</p>
              <div className="space-y-2 rounded-md border p-3">
                <h3 className="font-semibold">คำถาม ({exam.questions.length})</h3>
                {exam.questions.map((question, index) => (
                  <div key={question.question_id} className="rounded-md bg-muted p-2 text-sm">
                    {editingQuestionId === question.question_id ? (
                      <div className="grid gap-2">
                        <input className="login-input" value={editForm.question_text} onChange={(e) => setEditForm({ ...editForm, question_text: e.target.value })} />
                        {editForm.choices.map((choice, choiceIndex) => (
                          <div key={choiceIndex} className="flex gap-2">
                            <input
                              className="login-input"
                              value={choice}
                              onChange={(e) => {
                                const next = [...editForm.choices];
                                next[choiceIndex] = e.target.value;
                                setEditForm({ ...editForm, choices: next });
                              }}
                            />
                            <label className="flex min-w-24 items-center gap-2">
                              <input type="radio" name={`edit-correct-${question.question_id}`} checked={editForm.correct_index === choiceIndex} onChange={() => setEditForm({ ...editForm, correct_index: choiceIndex })} />
                              เฉลย
                            </label>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Button type="button" onClick={() => saveEdit(exam.exam_id, question.question_id)}>บันทึก</Button>
                          <Button type="button" className="bg-background text-foreground ring-1 ring-border" onClick={() => setEditingQuestionId("")}>ยกเลิก</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <p>{index + 1}. <MathText text={question.question_text} /></p>
                          <div className="flex gap-2">
                            <button className="text-primary" onClick={() => startEdit(question)}>แก้ไข</button>
                            <button className="text-destructive" onClick={() => api.deleteQuestion(exam.exam_id, question.question_id).then(load)}>ลบ</button>
                          </div>
                        </div>
                        <div className="mt-1 grid gap-1">
                          {question.choices.map((choice, choiceIndex) => (
                            <span key={choiceIndex} className={choice.is_correct ? "font-semibold text-primary" : ""}>
                              {choiceIndex + 1}. <MathText text={choice.choice_text} />{choice.is_correct ? " (เฉลย)" : ""}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <form className="grid gap-2 rounded-md border p-3" onSubmit={(event) => addQuestion(event, exam.exam_id)}>
                <input
                  className="login-input"
                  placeholder="โจทย์ เช่น ค่า $\\sqrt{13^2}$ คือข้อใด"
                  value={questionForm(exam.exam_id).question_text}
                  onChange={(e) => setQuestionForms({ ...questionForms, [exam.exam_id]: { ...questionForm(exam.exam_id), question_text: e.target.value } })}
                  required
                />
                {questionForm(exam.exam_id).choices.map((choice, choiceIndex) => (
                  <div key={choiceIndex} className="flex gap-2">
                    <input
                      className="login-input"
                      placeholder={`ตัวเลือก ${choiceIndex + 1} เช่น $\\frac{1}{2}$`}
                      value={choice}
                      onChange={(e) => {
                        const next = [...questionForm(exam.exam_id).choices];
                        next[choiceIndex] = e.target.value;
                        setQuestionForms({ ...questionForms, [exam.exam_id]: { ...questionForm(exam.exam_id), choices: next } });
                      }}
                      required={choiceIndex < 2}
                    />
                    <label className="flex min-w-24 items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={`correct-${exam.exam_id}`}
                        checked={questionForm(exam.exam_id).correct_index === choiceIndex}
                        onChange={() => setQuestionForms({ ...questionForms, [exam.exam_id]: { ...questionForm(exam.exam_id), correct_index: choiceIndex } })}
                      />
                      เฉลย
                    </label>
                  </div>
                ))}
                <Button type="submit">เพิ่มคำถาม</Button>
              </form>
              <Button className="bg-destructive text-destructive-foreground" onClick={() => api.deleteExam(exam.exam_id).then(load)}>ลบข้อสอบ</Button>
            </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
      {scoresOnly && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>คะแนนนักเรียน</CardTitle>
            <Button className="gap-2" onClick={exportScores} disabled={!data?.sessions.length}>
              <Download className="h-4 w-4" />
              Export คะแนนนักเรียน
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr><th className="text-left">ข้อสอบ</th><th className="text-left">นักเรียน</th><th>คะแนน</th><th>สถานะ</th><th></th></tr></thead>
              <tbody>
                {data?.sessions.map((session) => (
                  <tr key={session.session_id} className="border-t">
                    <td className="py-2">{session.exam_name}</td>
                    <td>{session.student.name} {session.student.class_name} เลขที่ {session.student.student_no}</td>
                    <td className="text-center">{session.score}/{session.total_score}</td>
                    <td className="text-center">{session.status}</td>
                    <td>{session.status === "LOCKED" && <Button onClick={() => api.unlockSession(session.session_id).then(load)}>ปลดล็อก</Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
