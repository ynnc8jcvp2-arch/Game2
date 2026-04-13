import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db, handleFirestoreError } from '../firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Calculator, Clock, Camera, Loader2, Save, AlertCircle, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseGradesFromImage } from '../services/geminiService';
import { UserProfile, Course, Assessment, OperationType } from '../types';

interface GradeEntryProps {
  user: User;
  profile: UserProfile | null;
  courses: Course[];
  assessments: Assessment[];
  onComplete?: () => void;
}

export default function GradeEntry({ user, profile, courses, assessments, onComplete }: GradeEntryProps) {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Assessment['type']>(profile?.defaultAssessmentType || 'Test');
  const [score, setScore] = useState('');
  const [total, setTotal] = useState('');
  const [weight, setWeight] = useState(profile?.defaultAssessmentWeight?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDefaults, setIsSavingDefaults] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [showKCAT, setShowKCAT] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // KCAT breakdown
  const [k, setK] = useState('');
  const [c, setC] = useState('');
  const [a, setA] = useState('');
  const [t, setT] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      if (profile.defaultAssessmentType) setType(profile.defaultAssessmentType);
      if (profile.defaultAssessmentWeight) setWeight(profile.defaultAssessmentWeight.toString());
    }
  }, [profile]);

  const handleSaveDefaults = async () => {
    if (!profile) return;
    setIsSavingDefaults(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        defaultAssessmentType: type,
        defaultAssessmentWeight: Number(weight)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setIsSavingDefaults(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!profile || !weight) return;
    setIsSavingTemplate(true);
    try {
      const newTemplate = {
        label: `${type} (${weight}%)`,
        type,
        weight: Number(weight)
      };
      const currentTemplates = profile.quickAddTemplates || [];
      if (!currentTemplates.some(t => t.type === type && t.weight === Number(weight))) {
        await updateDoc(doc(db, 'users', user.uid), {
          quickAddTemplates: [...currentTemplates, newTemplate]
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedCourseId || !title || !score || !total) return;

    const finalWeight = weight ? Number(weight) : Number(total);

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'assessments'), {
        uid: user.uid,
        courseId: selectedCourseId,
        title,
        type,
        score: Number(score),
        total: Number(total),
        weight: finalWeight,
        kcat: showKCAT ? {
          k: Number(k) || 0,
          c: Number(c) || 0,
          a: Number(a) || 0,
          t: Number(t) || 0
        } : null,
        date: serverTimestamp()
      });
      
      setTitle('');
      setScore('');
      setTotal('');
      setK('');
      setC('');
      setA('');
      setT('');
      setShowForm(false);
      
      if (onComplete) onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'assessments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!selectedCourseId) {
      alert("Please select a course first.");
      return;
    }

    setIsParsing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const parsedGrades = await parseGradesFromImage(base64, file.type);
        
        if (parsedGrades && parsedGrades.length > 0) {
          for (const grade of parsedGrades) {
            await addDoc(collection(db, 'assessments'), {
              uid: user.uid,
              courseId: selectedCourseId,
              title: grade.title,
              type: grade.type || 'Other',
              score: grade.score,
              total: grade.total,
              weight: grade.weight || 10,
              date: serverTimestamp()
            });
          }
          if (onComplete) onComplete();
        }
      } catch (err) {
        console.error("Import process failed:", err);
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Plus className="w-5 h-5" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-gradient">Quick Add</h1>
        </div>
        <p className="text-on-surface-variant">
          Fast input or import from your learning platform
        </p>
      </div>

      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-white/10 rounded-[32px] p-16 flex flex-col items-center justify-center hover:border-primary/50 hover:bg-white/5 transition-all group"
        >
          <Plus className="w-8 h-8 text-on-surface-variant group-hover:text-primary mb-4 transition-colors" />
          <h3 className="text-xl font-bold mb-2">Add a new grade</h3>
          <p className="text-sm text-on-surface-variant">Under 10 seconds</p>
        </button>
      ) : (
        <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">New Grade</h2>
            <div className="flex items-center gap-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsing || !selectedCourseId}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary text-xs font-bold hover:bg-primary/20 transition-all disabled:opacity-50"
              >
                {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                Scan Screenshot
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">Course</label>
                <select 
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full input-field"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">Task Name</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full input-field"
                  placeholder="e.g. Unit 1 Test"
                  required
                />
              </div>
            </div>

            {/* Quick Add Templates */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-on-surface-variant">Templates</label>
                <button 
                  type="button"
                  onClick={handleSaveTemplate}
                  disabled={isSavingTemplate || !weight}
                  className="text-xs font-bold text-primary hover:brightness-125 transition-all flex items-center gap-1.5 disabled:opacity-30"
                >
                  {isSavingTemplate ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Save Current as Template
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile?.quickAddTemplates || [
                  { label: 'Quiz (5%)', type: 'Quiz', weight: 5 },
                  { label: 'Test (15%)', type: 'Test', weight: 15 },
                  { label: 'Assignment (10%)', type: 'Assignment', weight: 10 }
                ]).map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setType(tmpl.type);
                      setWeight(tmpl.weight.toString());
                      setTitle(`${tmpl.type} ${assessments.filter(a => a.type === tmpl.type && a.courseId === selectedCourseId).length + 1}`);
                    }}
                    className="px-4 py-2 bg-surface-container-high border border-white/5 rounded-lg text-xs font-bold hover:border-primary/50 hover:text-primary transition-all"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full input-field"
                >
                  <option value="Test">Test</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Exam">Exam</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">Score</label>
                <input 
                  type="number"
                  step="0.1"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full input-field"
                  placeholder="0.0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">Total</label>
                <input 
                  type="number"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  className="w-full input-field"
                  placeholder="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">Weight</label>
                <input 
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full input-field"
                  placeholder="Auto-calculates if empty"
                />
              </div>
            </div>

            {/* KCAT Toggle */}
            <div className="pt-4 border-t border-white/5">
              <button 
                type="button"
                onClick={() => setShowKCAT(!showKCAT)}
                className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
              >
                {showKCAT ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                KCAT Breakdown (Advanced)
              </button>

              <AnimatePresence>
                {showKCAT && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Knowledge</label>
                        <input type="number" value={k} onChange={(e) => setK(e.target.value)} className="w-full input-field text-xs" placeholder="%" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Communication</label>
                        <input type="number" value={c} onChange={(e) => setC(e.target.value)} className="w-full input-field text-xs" placeholder="%" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Application</label>
                        <input type="number" value={a} onChange={(e) => setA(e.target.value)} className="w-full input-field text-xs" placeholder="%" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Thinking</label>
                        <input type="number" value={t} onChange={(e) => setT(e.target.value)} className="w-full input-field text-xs" placeholder="%" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm font-bold text-on-surface-variant hover:text-white transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleSaveDefaults}
                  disabled={isSavingDefaults}
                  className="flex items-center gap-2 text-xs font-bold text-primary hover:brightness-125 transition-all disabled:opacity-30"
                >
                  {isSavingDefaults ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save as Defaults
                </button>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-8 py-3 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Save Grade
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
