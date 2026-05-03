'use client';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';   // <-- اضافه شد
import { Lock, PlayCircle } from 'lucide-react';

export default function CourseCurriculum({ sections }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">سرفصل‌های دوره</h2>
      <Accordion type="multiple" className="w-full">
        {sections.map((section) => (
          <AccordionItem key={section._id} value={section._id}>
            <AccordionTrigger>
              <div className="flex justify-between w-full">
                <span>{section.title}</span>
                <span className="text-sm text-gray-500">{section.lessons?.length || 0} درس</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {section.lessons?.map((lesson, idx) => (
                  <li key={lesson._id} className="flex items-center gap-2 text-sm">
                    {lesson.isFree ? <PlayCircle className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-gray-400" />}
                    <span>{idx + 1}. {lesson.title}</span>
                    {lesson.isFree && <Badge variant="outline" className="text-xs">رایگان</Badge>}
                    <span className="text-gray-400 text-xs mr-auto">{Math.floor(lesson.videoDuration / 60)} دقیقه</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}