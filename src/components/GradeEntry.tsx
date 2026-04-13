import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db, handleFirestoreError } from '../firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Calculator, Clock, Camera, Loader2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseGradesFromImage } from '../services/geminiService';
import { UserProfile, Course, Assessment, OperationType } from '../types';

interface GradeEntryProps {
  user: User;
  profile: UserProfile | null;
  courses: Course[];
  assessments: Assessment[];
}

export default function GradeEntry({ user, profile, courses, assessments }: GradeEntryProps) {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Assessment['type']>(profile?.defaultAssessmentType || 'Test');
  const [score, setScore] = useState('');
  const [total, setTotal] = useState('');
  const [weight, setWeight] = useState(profile?.defaultAssessmentWeight?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDefaults, setIsSavingDefaults] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update defaults when profile changes
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
      alert('Default preferences saved!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setIsSavingDefaults(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedCourseId || !title || !score || !total || !weight) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'assessments'), {
        uid: user.uid,
        courseId: selectedCourseId,
        title,
        type,
        score: Number(score),
        total: Number(total),
        weight: Number(weight),
        date: serverTimestamp()
      });
      
      // Create feed event for significant improvements or just activity
      await addDoc(collection(db, 'feed'), {
        uid: user.uid,
        userName: user.displayName,
        type: 'grade_improvement',
        content: `just logged a ${((Number(score)/Number(total))*100).toFixed(0)}% on a ${title} in ${courses.find(c => c.id === selectedCourseId)?.name}!`,
        createdAt: serverTimestamp()
      });

      setTitle('');
      setScore('');
      setTotal('');
      // Reset to defaults
      setType(profile?.defaultAssessmentType || 'Test');
      setWeight(profile?.defaultAssessmentWeight?.toString() || '');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'assessments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = (taskType: Assessment['type'], defaultWeight: string) => {
    setType(taskType);
    setWeight(defaultWeight);
    setTitle(`${taskType} ${assessments.filter(a => a.type === taskType && a.courseId === selectedCourseId).length + 1}`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!selectedCourseId) {
      alert("Please select a course first so we know where to import these grades.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Unsupported image format. Please use PNG, JPEG, or WEBP.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsParsing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const parsedGrades = await parseGradesFromImage(base64, file.type);
        
        if (parsedGrades && parsedGrades.length > 0) {
          let successCount = 0;
          for (const grade of parsedGrades) {
            try {
              // Basic validation of parsed data
              if (!grade.title || typeof grade.score !== 'number' || typeof grade.total !== 'number') continue;

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
              successCount++;
            } catch (err) {
              console.error("Error saving parsed grade:", err);
            }
          }
          
          if (successCount > 0) {
            // Create a single feed event for the batch import
            await addDoc(collection(db, 'feed'), {
              uid: user.uid,
              userName: user.displayName,
              type: 'grade_improvement',
              content: `just imported ${successCount} grades from a screenshot into ${courses.find(c => c.id === selectedCourseId)?.name}!`,
              createdAt: serverTimestamp()
            });
            alert(`Successfully imported ${successCount} grades!`);
          } else {
            alert("Found data but couldn't save any grades. Please check the image quality.");
          }
        } else {
          alert("Could not find any readable grade data in the image. Try a clearer screenshot.");
        }
      } catch (err) {
        console.error("Import process failed:", err);
        alert("An error occurred during the import process. Please try again.");
      } finally {
        setIsParsing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      alert("Failed to read the file.");
      setIsParsing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'assessments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'assessments');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grade Terminal</h1>
          <p className="text-on-surface-variant">High-frequency data entry for academic records.</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*"
          />
          <motion.button 
            whileHover={{ scale: 1.05, rotateX: -5, rotateY: 5 }}
            whileTap={{ scale: 0.95, rotateX: 10, rotateY: -10 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 text-xs font-bold uppercase tracking-widest hover:bg-indigo-500/20 transition-all"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            Import Screenshot
          </motion.button>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-xs font-bold uppercase tracking-widest">
            <Clock className="w-4 h-4" />
            Sub-10s Entry
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Entry Form */}
        <div className="md:col-span-1 relative">
          <AnimatePresence>
            {isParsing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 glass-panel rounded-xl flex flex-col items-center justify-center bg-surface/60 backdrop-blur-md"
              >
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-sm font-bold text-primary animate-pulse">Gemini is parsing...</p>
                <p className="text-[10px] text-on-surface-variant mt-2">Extracting academic data</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              New Entry
            </h3>
            
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Course</label>
              <select 
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full input-field bg-surface-container-low"
                required
              >
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-2">Quick Templates</label>
              <div className="flex flex-wrap gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleQuickAdd('Quiz', '5')}
                  className="px-3 py-1 bg-surface-container-low border border-outline-variant/10 rounded-full text-[10px] font-bold hover:bg-primary/5 hover:text-primary transition-all"
                >
                  Quiz (5%)
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleQuickAdd('Test', '15')}
                  className="px-3 py-1 bg-surface-container-low border border-outline-variant/10 rounded-full text-[10px] font-bold hover:bg-primary/5 hover:text-primary transition-all"
                >
                  Test (15%)
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleQuickAdd('Assignment', '10')}
                  className="px-3 py-1 bg-surface-container-low border border-outline-variant/10 rounded-full text-[10px] font-bold hover:bg-primary/5 hover:text-primary transition-all"
                >
                  Assign (10%)
                </motion.button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Task Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full input-field"
                placeholder="e.g. Unit 1 Test"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full input-field bg-surface-container-low"
                >
                  <option value="Test">Test</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Exam">Exam</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Weight (%)</label>
                <input 
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full input-field"
                  placeholder="15"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveDefaults}
                disabled={isSavingDefaults || !weight}
                className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
              >
                {isSavingDefaults ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save as Default
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Score</label>
                <input 
                  type="number"
                  step="0.1"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full input-field"
                  placeholder="45"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Total</label>
                <input 
                  type="number"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  className="w-full input-field"
                  placeholder="50"
                  required
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02, rotateX: -5 }}
              whileTap={{ scale: 0.98, rotateX: 5 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary mt-4 flex items-center justify-center gap-2"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {isSubmitting ? 'Saving...' : 'Commit Entry'}
            </motion.button>
          </form>
        </div>

        {/* Recent Grades Table */}
        <div className="md:col-span-2">
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
              <h3 className="font-bold">Ledger History</h3>
              <Calculator className="w-4 h-4 text-on-surface-variant" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="p-4 text-[10px] font-bold text-on-surface-variant uppercase">Course</th>
                    <th className="p-4 text-[10px] font-bold text-on-surface-variant uppercase">Task</th>
                    <th className="p-4 text-[10px] font-bold text-on-surface-variant uppercase">Result</th>
                    <th className="p-4 text-[10px] font-bold text-on-surface-variant uppercase">Weight</th>
                    <th className="p-4 text-[10px] font-bold text-on-surface-variant uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {assessments.map(a => {
                    const course = courses.find(c => c.id === a.courseId);
                    return (
                      <motion.tr 
                        layout
                        key={a.id} 
                        whileHover={{ scale: 1.01, backgroundColor: 'rgba(0,0,0,0.02)' }}
                        className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <td className="p-4">
                          <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: course?.color + '20', color: course?.color }}>
                            {course?.name}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-medium">{a.title}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase">{a.type}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-bold">{a.score}/{a.total}</p>
                          <p className="text-[10px] text-primary font-bold">{((a.score / a.total) * 100).toFixed(1)}%</p>
                        </td>
                        <td className="p-4 text-sm font-medium">{a.weight}%</td>
                        <td className="p-4">
                          <button 
                            onClick={() => handleDelete(a.id)}
                            className="p-2 text-on-surface-variant hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                  {assessments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-on-surface-variant italic text-sm">
                        No entries found in the ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
