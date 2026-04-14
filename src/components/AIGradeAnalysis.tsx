import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import { Course, Assessment } from '../types';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

interface AIGradeAnalysisProps {
  courses: Course[];
  assessments: Assessment[];
}

export default function AIGradeAnalysis({ courses, assessments }: AIGradeAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is missing. Please configure it in the environment.");
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are an expert academic advisor and AI tutor. Analyze the following student's grades and provide a personalized study plan, grade predictions, and actionable recommendations.

Courses:
${JSON.stringify(courses.map(c => ({ name: c.name, targetMark: c.targetMark })), null, 2)}

Assessments:
${JSON.stringify(assessments.map(a => ({ 
  courseId: courses.find(c => c.id === a.courseId)?.name || 'Unknown',
  title: a.title, 
  type: a.type, 
  score: a.score, 
  total: a.total, 
  weight: a.weight,
  kcat: a.kcat 
})), null, 2)}

Please provide:
1. A brief summary of their current academic standing.
2. Specific areas of improvement (e.g., "You are losing marks in Knowledge sections in Chemistry").
3. A personalized study strategy for their upcoming assessments.
4. A realistic grade prediction if they follow this strategy.

Format your response in clean, readable Markdown. Do not use top-level heading 1 (#), start with heading 2 (##) or 3 (###).
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are an encouraging, highly analytical AI academic advisor. Provide concise, actionable, and data-driven insights.",
        }
      });

      if (response.text) {
        setAnalysis(response.text);
      } else {
        throw new Error("Failed to generate analysis.");
      }
    } catch (err: any) {
      console.error("AI Analysis Error:", err);
      setError(err.message || "An unexpected error occurred while generating insights.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-low border border-white/5 p-8 rounded-[32px] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">AI-Powered Insights</h3>
            <p className="text-sm text-on-surface-variant">Real-time grade predictions & study recommendations</p>
          </div>
        </div>
        
        {!analysis && !isLoading && (
          <button 
            onClick={generateAnalysis}
            className="flex items-center justify-center gap-2 bg-primary text-surface font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Generate Analysis
          </button>
        )}
      </div>

      <div className="relative z-10">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-primary">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-bold animate-pulse">Analyzing your academic ledger...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {analysis && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-invert prose-primary max-w-none"
          >
            <div className="markdown-body bg-surface-container border border-white/5 p-6 rounded-2xl">
              <Markdown>{analysis}</Markdown>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={generateAnalysis}
                className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-white transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Regenerate Analysis
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
