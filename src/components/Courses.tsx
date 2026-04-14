import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { db, handleFirestoreError } from '../firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Target, BookOpen, Loader2, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { Course, OperationType } from '../types';

interface CoursesProps {
  user: User;
  courses: Course[];
}

export default function Courses({ user, courses }: CoursesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTarget, setNewCourseTarget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState('');

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'courses'), {
        uid: user.uid,
        name: newCourseName,
        code: newCourseCode || null,
        targetMark: newCourseTarget ? Number(newCourseTarget) : null,
        createdAt: serverTimestamp()
      });
      setNewCourseName('');
      setNewCourseCode('');
      setNewCourseTarget('');
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'courses');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course? All associated grades will remain but may not display correctly.')) return;
    try {
      await deleteDoc(doc(db, 'courses', courseId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `courses/${courseId}`);
    }
  };

  const handleUpdateTarget = async (courseId: string) => {
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        targetMark: editTarget ? Number(editTarget) : null
      });
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `courses/${courseId}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-gradient">Courses</h1>
          </div>
          <p className="text-on-surface-variant">
            Manage your courses and set target marks
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low border border-white/5 p-6 rounded-[32px]"
        >
          <form onSubmit={handleAddCourse} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Course Name</label>
              <input 
                type="text"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="w-full input-field"
                placeholder="e.g. Advanced Functions"
                required
              />
            </div>
            <div className="flex-1 w-full max-w-[150px]">
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Code (Opt)</label>
              <input 
                type="text"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                className="w-full input-field"
                placeholder="e.g. MHF4U"
              />
            </div>
            <div className="flex-1 w-full max-w-[150px]">
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Target (%)</label>
              <input 
                type="number"
                value={newCourseTarget}
                onChange={(e) => setNewCourseTarget(e.target.value)}
                className="w-full input-field"
                placeholder="e.g. 95"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 text-sm font-bold text-on-surface-variant hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="btn-primary px-6 py-3 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Save
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid gap-4">
        {courses.map(course => (
          <div key={course.id} className="bg-surface-container-low border border-white/5 p-6 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-white/10 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white font-bold text-xl">
                {course.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {course.code ? <span className="text-primary mr-2">{course.code}</span> : null}
                  {course.name}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Added {course.createdAt?.toDate ? course.createdAt.toDate().toLocaleDateString() : 'recently'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {editingId === course.id ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                    className="input-field w-24 py-2 text-sm"
                    placeholder="Target %"
                  />
                  <button 
                    onClick={() => handleUpdateTarget(course.id)}
                    className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setEditingId(null)}
                    className="p-2 bg-white/5 text-on-surface-variant rounded-lg hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div 
                  className="flex items-center gap-2 cursor-pointer group/target"
                  onClick={() => {
                    setEditingId(course.id);
                    setEditTarget(course.targetMark?.toString() || '');
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant group-hover/target:text-white transition-colors">Target Mark</p>
                    <p className="font-bold text-blue-500">
                      {course.targetMark ? `${course.targetMark}%` : 'Not set'}
                    </p>
                  </div>
                </div>
              )}

              <button 
                onClick={() => handleDeleteCourse(course.id)}
                className="p-3 text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Delete Course"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {courses.length === 0 && !isAdding && (
          <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
            <BookOpen className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No courses yet</h3>
            <p className="text-on-surface-variant mb-6">Add your first course to start tracking grades</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
